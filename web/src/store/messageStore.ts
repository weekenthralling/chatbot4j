import { create } from "zustand";
import { isNil } from "lodash";
import { HumanMessageDTO, MessageDTO } from "@/request/types";
import { groupMessages } from "@/utils/messages";


// 定义 store 的类型
interface MessageState {
  messages: any[];
  preSendMessage?: HumanMessageDTO;
  setMessagesData: (messages: MessageDTO[]) => void;
  updateOrAddMessage: (message: MessageDTO) => void;
  appendOrAddMessage: (message: MessageDTO) => void;
  deleteMessage: (message: Partial<MessageDTO>) => void;
  setPreSendMessage: (message?: HumanMessageDTO) => void;
}

export const useMessageStore = create<MessageState>()((set) => ({
  messages: [],
  preSendMessage: undefined,
  setMessagesData: (messages) =>
    set(() => ({ messages: groupMessages(messages ?? []) })),
  updateOrAddMessage: (message) => {
    const currentMessages = useMessageStore.getState().messages;
    const messages = [...currentMessages];
    const { parent_id, id } = message;
    // If parent_id is null, create a new message group and add the message.
    // Note that we need to generate a new parent_id for the message if it has no parent_id.
    // Otherwise, all messages with no parent_id will be grouped together.
    if (isNil(parent_id)) {
      const newParentId = crypto.randomUUID();
      set(() => ({
        messages: [
          ...messages,
          { newParentId, messages: [{ parent_id: newParentId, ...message }] },
        ],
      }));
      return;
    }
    // Else, find the corresponding parent group.
    const groupMatchIndex = messages.findLastIndex(
      (group) => group.id === parent_id,
    );
    // If the parent group is not found, create a new group.
    if (groupMatchIndex === -1) {
      set(() => ({
        messages: [...messages, { id: parent_id, messages: [{ ...message }] }],
      }));
      return;
    }

    // Parent group found.
    const groupMatch = messages[groupMatchIndex];

    // Find the message index in the parent group.
    const messageMatchIndex = groupMatch.messages.findLastIndex(
      (message: MessageDTO) => message.id === id,
    );

    // If the message is not found, add it to the end of the group.
    if (messageMatchIndex === -1) {
      set(() => ({
        messages: [
          ...messages.slice(0, groupMatchIndex),
          {
            ...groupMatch,
            messages: [...groupMatch.messages, { ...message }],
          },
          ...messages.slice(groupMatchIndex + 1),
        ],
      }));
      return;
    }

    // Else, update the message content.
    const updatedMessage = {
      ...groupMatch.messages[messageMatchIndex],
      ...message,
    };

    // Replace the message in the group.
    const updatedGroup = {
      ...groupMatch,
      messages: [
        ...groupMatch.messages.slice(0, messageMatchIndex),
        updatedMessage,
        ...groupMatch.messages.slice(messageMatchIndex + 1),
      ],
    };

    // And replace the group in the messages.
    set(() => ({
      messages: [
        ...messages.slice(0, groupMatchIndex),
        updatedGroup,
        ...messages.slice(groupMatchIndex + 1),
      ],
    }));
  },
  appendOrAddMessage: (message) => {
    const currentMessages = useMessageStore.getState().messages;
    const messages = [...currentMessages];
    const { parent_id, id } = message;
    // If parent_id is null, create a new message group and add the message.
    // Note that we need to generate a new parent_id for the message if it has no parent_id.
    // Otherwise, all messages with no parent_id will be grouped together.
    if (isNil(parent_id)) {
      const newParentId = crypto.randomUUID();
      set(() => ({
        messages: [
          ...messages,
          { newParentId, messages: [{ parent_id: newParentId, ...message }] },
        ],
      }));
      return;
    }

    // Else, find the corresponding parent group.
    const groupMatchIndex = messages.findLastIndex(
      (group) => group.id === parent_id,
    );

    // If the parent group is not found, create a new group.
    if (groupMatchIndex === -1) {
      set(() => ({
        messages: [...messages, { id: parent_id, messages: [{ ...message }] }],
      }));
      return;
    }

    // Parent group found.
    const groupMatch = messages[groupMatchIndex];

    // Find the message index in the parent group.
    const messageMatchIndex = groupMatch.messages.findLastIndex(
      (message: MessageDTO) => message.id === id,
    );
    // If the message is not found, add it to the end of the group.
    if (messageMatchIndex === -1) {
      set(() => ({
        messages: [
          ...messages.slice(0, groupMatchIndex),
          {
            ...groupMatch,
            messages: [...groupMatch.messages, { ...message }],
          },
          ...messages.slice(groupMatchIndex + 1),
        ],
      }));
      return;
    }

    // Else, update the message.
    // The `content` and `reasoning` is "concated", everything else are "updated".
    const matchedMessage = groupMatch.messages[messageMatchIndex];
    const updatedMessage = {
      ...matchedMessage,
      ...message,
      content: matchedMessage.content + message.content,
      reasoning: (matchedMessage.reasoning ?? "") + (message.reasoning ?? ""),
    };
    // Replace the message in the group.
    const updatedGroup = {
      ...groupMatch,
      messages: [
        ...groupMatch.messages.slice(0, messageMatchIndex),
        updatedMessage,
        ...groupMatch.messages.slice(messageMatchIndex + 1),
      ],
    };

    // And replace the group in the messages.
    set(() => ({
      messages: [
        ...messages.slice(0, groupMatchIndex),
        updatedGroup,
        ...messages.slice(groupMatchIndex + 1),
      ],
    }));
  },
  deleteMessage: (message) => {
    const currentMessages = useMessageStore.getState().messages;
    const { parent_id, id } = message;
    const messages = [...currentMessages];

    const groupMatchIndex = messages.findLastIndex((group) =>
      isNil(parent_id) ? group.id === id : group.id === parent_id,
    );

    if (groupMatchIndex === -1) {
      console.warn("ignoring unexpected message delete", message);
      return null;
    }
    const groupMatch = messages[groupMatchIndex];

    // 过滤掉要删除的消息
    const filteredMessages = groupMatch.messages.filter(
      (message: MessageDTO) => message.id !== id,
    );
    if (filteredMessages.length === 0) {
      // 如果组内没有剩余消息，删除整个组
      set(() => ({
        messages: [
          ...messages.slice(0, groupMatchIndex),
          ...messages.slice(groupMatchIndex + 1),
        ],
      }));
    } else {
      set(() => ({
        messages: [
          ...messages.slice(0, groupMatchIndex),
          { ...groupMatch, messages: filteredMessages },
          ...messages.slice(groupMatchIndex + 1),
        ],
      }));
    }
  },
  setPreSendMessage: (message) => set(() => ({ preSendMessage: message })),
}));

export const {
  setMessagesData,
  updateOrAddMessage,
  appendOrAddMessage,
  deleteMessage,
  setPreSendMessage,
} = useMessageStore.getState();
