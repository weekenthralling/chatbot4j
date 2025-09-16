import { useEffect, useRef, useState } from "react";
import { isObject, throttle } from "lodash";
import { useLoaderData, useParams } from "react-router";
import { UploadProps } from "antd/es/upload/interface";
import { CircleX, X } from "lucide-react";

import GroupedMessage from "@/components/message/GroupedMessage";
import ChatInput from "@/components/ChatInput";
import { getConvOnServer, uploadFile } from "@/request/conv";
import { ConversationDTO, HumanMessageDTO } from "@/request/types";
import { useChatLayout } from "@/hooks/useChatLayout";
import { moveTopByConvId, updateConv } from "@/store/convsStore";
import {
  appendOrAddMessage,
  deleteMessage,
  setMessagesData,
  setPreSendMessage,
  updateOrAddMessage,
  useMessageStore,
} from "@/store/messageStore";
import { useModelsStore } from "@/store/modelsStore";
import { useUserStore } from "@/store/userStore";
import { useGlobalNotification } from "@/contexts/NotificationProvider";

export async function loader({ params }: any): Promise<ConversationDTO> {
  const id = params.id;

  // If there's a preSendMessage, we can skip the server fetch since we'll be sending immediately
  // This handles the case where we just created a conversation and are about to send the first message
  if (typeof window !== "undefined") {
    try {
      const messageStore = useMessageStore.getState();
      if (messageStore.preSendMessage) {
        // Return minimal conversation object - the real messages will come from the SSE response
        return {
          id,
          title: "New Chat",
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ConversationDTO;
      }
    } catch {
      // ignore and continue to server fetch
    }
  }

  // Normal case: fetch from server
  return await getConvOnServer(id);
}

const Chatbox = () => {
  const conv = useLoaderData();
  const { id: convId } = useParams();

  const userInfo = useUserStore((state) => state.userInfo);
  const messages = useMessageStore((state) => state.messages);
  const preSendMessage = useMessageStore((state) => state.preSendMessage);
  const checkedModel = useModelsStore((state) => state.checkedModel);
  const { contentContainerClasses } = useChatLayout();
  const [answering, setAnswering] = useState(false);
  const chatLogContainerRef = useRef<HTMLDivElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const [uploadFileList, setUploadFileList] = useState<UploadProps["fileList"]>(
    [],
  );

  // Keep track of current request for cancellation
  const eventSourceRef = useRef<AbortController | null>(null);

  const notificationApi = useGlobalNotification();

  const showErrorNotification = (title: string, detail: string) => {
    notificationApi.error({
      message: <div className="pt-1 pl-2 font-medium">{title}</div>,
      description: <div className="pl-2 text-text-secondary">{detail}</div>,
      duration: 5,
      icon: <CircleX className="text-[24px] text-danger" />,
      closeIcon: <X className="text-text-secondary" />,
      showProgress: true,
    });
  };

  // Handle sending a message and starting an SSE stream using native fetch
  const sendMessageSSE = async (messageData: HumanMessageDTO) => {
    try {
      // Close existing stream if any
      if (eventSourceRef.current) {
        eventSourceRef.current.abort();
        eventSourceRef.current = null;
      }

      // Create an AbortController for this request
      const abortController = new AbortController();
      eventSourceRef.current = abortController;

      // Use native fetch for SSE handling with POST
      const response = await fetch(`/api/${conv.id}/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(messageData),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to send message: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Unique ID for this message stream
      const run_id = `run--${crypto.randomUUID()}`;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setAnswering(false);
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages in buffer
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5); // Remove 'data:' prefix

              if (!data.trim()) continue;

              // Handle special end event
              // the API returns the end event with the content `data: [DONE]` to signal the end of the stream.
              if (data === "[DONE]") {
                setAnswering(false);
                continue;
              }

              try {
                // TODO: ChatBot only sends content via stream, so need to construct message object here.
                // We may want to change this in the future to send full message objects.
                const message = {
                  content: data,
                  type: "AIMessageChunk",
                  parent_id: messageData.id,
                  from: "ai",
                  id: run_id,
                  sent_at: new Date().toISOString(),
                  attachments: [],
                  additional_kwargs: { model: checkedModel?.name, run_id },
                }
                handleMessageEvent(message);
              } catch (parseError) {
                console.warn("Failed to parse SSE message:", data, parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted");
        return;
      }

      console.error("Error sending message:", error);
      showErrorNotification("发送失败", "消息发送失败，请重试");
      setAnswering(false);
    }
  };

  // Process incoming SSE messages - keep the original message handling logic
  // MessageDTO is not complete so we use any for now
  const handleMessageEvent = (message: any) => {
    switch (message.type) {
      case "human": // langchain's HumanMessage.type
      case "ai": // langchain's AIMessage.type
      case "tool": // langchain's ToolMessage.type
        updateOrAddMessage(message);
        moveTopByConvId(conv.id!);
        break;
      case "AIMessageChunk": // langchain's AIMessageChunk.type
      case "ToolMessageChunk": // langchain's ToolMessageChunk.type
        appendOrAddMessage(message);
        break;
      // control messages
      case "info":
        if (message.content === "workflow/start") {
          setAnswering(true);
          break;
        }
        if (message.content === "workflow/end") {
          setAnswering(false);
          break;
        }
        if (
          isObject(message.content) &&
          message.content.type === "title-generated"
        ) {
          updateConv({
            id: conv.id,
            title: message.content.payload,
          });
          break;
        }
        console.log(`Unknown info message: ${message.content}`);
        break;
      case "error":
        showErrorNotification("发生错误", message.content);
        setAnswering(false);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  };

  const handleSend = throttle((message) => {
    const toSend: HumanMessageDTO = {
      ...message,
      from: userInfo?.username ?? "", // NOTE: This is only for rendering, we still check authentication on backend
      additional_kwargs: {
        ...message.additional_kwargs,
        model: checkedModel?.name,
      },
    };

    updateOrAddMessage(toSend);
    setAnswering(true);
    sendMessageSSE(toSend);
  }, 200) as any;

  // TODO: these useEffects are async, we need to consider if preSendMessage
  // is handled before we handle conv.messages
  useEffect(() => {
    setMessagesData(conv.messages);
  }, [conv]);

  useEffect(() => {
    if (preSendMessage) {
      handleSend(preSendMessage);
      // Clear preSendMessage after sending
      setPreSendMessage(undefined);
    }
  }, [preSendMessage]);

  // Clean up SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.abort();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Set `shouldAutoScroll` when user scrolls the chat log.
  useEffect(() => {
    const chatLogContainerElem = chatLogContainerRef.current;
    if (!chatLogContainerElem) {
      return;
    }

    const handleWheel = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatLogContainerElem;

      // Usually scrollTop + clientHeight === scrollHeight when it is scrolled to the bottom.
      shouldAutoScroll.current = scrollTop + clientHeight >= scrollHeight - 20;
    };

    // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
    chatLogContainerElem.addEventListener("wheel", handleWheel);
    return () => {
      chatLogContainerElem.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Automatically scroll to bottom when new message comes
  useEffect(() => {
    const chatLogContainerElem = chatLogContainerRef.current;
    const chatLogElem = chatLogRef.current;
    if (!chatLogContainerElem || !chatLogElem) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!shouldAutoScroll.current) {
        return;
      }

      window.requestAnimationFrame(() => {
        chatLogContainerElem.scrollTo({
          top: chatLogContainerElem.scrollHeight,
          behavior: "smooth",
        });
      });
    });

    resizeObserver.observe(chatLogElem);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!messages.length) {
      return;
    }
    const chatLogContainerElem = chatLogContainerRef.current;
    if (!chatLogContainerElem) {
      return;
    }
    chatLogContainerElem.scrollTo({
      top: chatLogContainerElem.scrollHeight,
      behavior: "instant",
    });
  }, [messages.length]);

  const upload = async (files: File[]) => {
    // Immediately disable other operations after starting file upload
    setAnswering(true);
    for (const file of files) {
      const fid = crypto.randomUUID();
      const uploading: HumanMessageDTO = {
        parent_id: fid,
        id: fid,
        from: userInfo?.username ?? "", // NOTE: This is only for rendering, we still check authentication on backend
        type: "human",
        sent_at: new Date().toISOString(),
        content: "",
        attachments: [
          {
            filename: file.name,
            size: file.size,
            mimetype: file.type,
            status: "uploading",
          },
        ],
        additional_kwargs: {
          model: checkedModel?.name,
        },
      };
      updateOrAddMessage(uploading);
      const resp = await uploadFile(conv.id, file);
      const data = await resp.json();
      if (resp.ok) {
        const uploaded: HumanMessageDTO = {
          ...uploading,
          attachments: [
            {
              filename: file.name,
              size: file.size,
              mimetype: file.type,
              status: "uploaded",
            },
          ],
        };
        // Send via fetch with SSE instead of separate request
        sendMessageSSE(uploaded);
        updateOrAddMessage(uploaded);
      } else {
        deleteMessage({ id: fid });
        showErrorNotification("上传失败", data.detail);
      }
      // Reset upload list after upload finished
      setUploadFileList([]);
    }
  };

  const handleInterrupt = () => {
    try {
      setAnswering(false);

      // Close the current SSE connection when interrupting
      if (eventSourceRef.current) {
        eventSourceRef.current.abort();
        eventSourceRef.current = null;
      }
    } catch {
      // TODO: add messageAPI just for this?
    }
  };

  useEffect(() => {
    if (answering && conv?.id) {
      handleInterrupt();
    }
  }, [conv]);

  useEffect(() => {
    if (uploadFileList?.length) {
      upload(uploadFileList.map((file) => file.originFileObj) as File[]);
    }
  }, [uploadFileList]);

  return (
    <div
      id="chatbox"
      ref={chatLogContainerRef}
      className="overflow-y-auto h-full"
    >
      <div
        id="chatlog"
        ref={chatLogRef}
        className={`
          pb-20 sm:pb-24 md:pb-28
          ${contentContainerClasses}
        `}
      >
        {messages.map((group: any, index: number) => {
          return (
            <GroupedMessage
              key={index}
              children={group.messages}
              frozen={answering && index === messages.length - 1}
            />
          );
        })}
      </div>
      <div
        className={`
          absolute
          left-1/2 -translate-x-1/2 bottom-2
          z-10
          ${contentContainerClasses}
        `}
      >
        <ChatInput
          receiving={answering}
          onSend={handleSend}
          onInterrupt={handleInterrupt}
        />
      </div>
    </div>
  );
};

export default Chatbox;
