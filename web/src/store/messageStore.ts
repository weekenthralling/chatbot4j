import { create } from "zustand";
import { isNil } from "lodash";
import { HumanMessageDTO, MessageDTO } from "@/request/types";
import { groupMessages } from "@/utils/messages";

// 定义 store 的类型
interface MessageState {
  // Store messages per conversation ID
  messagesByConv: Map<string, any[]>;
  // Current active conversation ID
  activeConvId: string | null;
  // Messages for the current active conversation
  messages: any[];
  preSendMessage?: HumanMessageDTO;

  // Set the active conversation and load its messages
  setActiveConv: (convId: string) => void;

  // Set messages for a specific conversation
  setMessagesData: (convId: string, messages: MessageDTO[]) => void;

  // Update or add message to a specific conversation
  updateOrAddMessage: (convId: string, message: MessageDTO) => void;

  // Append or add message to a specific conversation
  appendOrAddMessage: (convId: string, message: MessageDTO) => void;

  // Delete message from a specific conversation
  deleteMessage: (convId: string, message: Partial<MessageDTO>) => void;

  setPreSendMessage: (message?: HumanMessageDTO) => void;

  // Check if a conversation has cached messages
  hasMessages: (convId: string) => boolean;
}

// Helper function to update messages for a conversation
const updateConvMessages = (
  messagesByConv: Map<string, any[]>,
  convId: string,
  updater: (messages: any[]) => any[],
): Map<string, any[]> => {
  const newMessagesByConv = new Map(messagesByConv);
  const currentMessages = messagesByConv.get(convId) || [];
  newMessagesByConv.set(convId, updater(currentMessages));
  return newMessagesByConv;
};

export const useMessageStore = create<MessageState>()((set, get) => ({
  messagesByConv: new Map(),
  activeConvId: null,
  messages: [],
  preSendMessage: undefined,

  setActiveConv: (convId: string) => {
    const { messagesByConv } = get();
    const messages = messagesByConv.get(convId) || [];
    set({ activeConvId: convId, messages });
  },

  setMessagesData: (convId: string, messages: MessageDTO[]) => {
    const { messagesByConv, activeConvId } = get();
    const groupedMessages = groupMessages(messages ?? []);
    const newMessagesByConv = new Map(messagesByConv);
    newMessagesByConv.set(convId, groupedMessages);

    // Update active messages if this is the active conversation
    if (activeConvId === convId) {
      set({ messagesByConv: newMessagesByConv, messages: groupedMessages });
    } else {
      set({ messagesByConv: newMessagesByConv });
    }
  },

  updateOrAddMessage: (convId: string, message: MessageDTO) => {
    const { messagesByConv, activeConvId } = get();

    const newMessagesByConv = updateConvMessages(messagesByConv, convId, (messages) => {
      const { parent_id, id } = message;
      const messagesCopy = [...messages];

      // If parent_id is null, create a new message group and add the message.
      if (isNil(parent_id)) {
        const newParentId = crypto.randomUUID();
        return [
          ...messagesCopy,
          { id: newParentId, messages: [{ parent_id: newParentId, ...message }] },
        ];
      }

      // Find the corresponding parent group.
      const groupMatchIndex = messagesCopy.findLastIndex((group) => group.id === parent_id);

      // If the parent group is not found, create a new group.
      if (groupMatchIndex === -1) {
        return [...messagesCopy, { id: parent_id, messages: [{ ...message }] }];
      }

      // Parent group found.
      const groupMatch = messagesCopy[groupMatchIndex];

      // Find the message index in the parent group.
      const messageMatchIndex = groupMatch.messages.findLastIndex(
        (msg: MessageDTO) => msg.id === id,
      );

      // If the message is not found, add it to the end of the group.
      if (messageMatchIndex === -1) {
        return [
          ...messagesCopy.slice(0, groupMatchIndex),
          {
            ...groupMatch,
            messages: [...groupMatch.messages, { ...message }],
          },
          ...messagesCopy.slice(groupMatchIndex + 1),
        ];
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
      return [
        ...messagesCopy.slice(0, groupMatchIndex),
        updatedGroup,
        ...messagesCopy.slice(groupMatchIndex + 1),
      ];
    });

    // Update state
    if (activeConvId === convId) {
      set({ messagesByConv: newMessagesByConv, messages: newMessagesByConv.get(convId) || [] });
    } else {
      set({ messagesByConv: newMessagesByConv });
    }
  },

  appendOrAddMessage: (convId: string, message: MessageDTO) => {
    const { messagesByConv, activeConvId } = get();

    const newMessagesByConv = updateConvMessages(messagesByConv, convId, (messages) => {
      const { parent_id, id } = message;
      const messagesCopy = [...messages];

      // If parent_id is null, create a new message group and add the message.
      if (isNil(parent_id)) {
        const newParentId = crypto.randomUUID();
        return [
          ...messagesCopy,
          { id: newParentId, messages: [{ parent_id: newParentId, ...message }] },
        ];
      }

      // Find the corresponding parent group.
      const groupMatchIndex = messagesCopy.findLastIndex((group) => group.id === parent_id);

      // If the parent group is not found, create a new group.
      if (groupMatchIndex === -1) {
        return [...messagesCopy, { id: parent_id, messages: [{ ...message }] }];
      }

      // Parent group found.
      const groupMatch = messagesCopy[groupMatchIndex];

      // Find the message index in the parent group.
      const messageMatchIndex = groupMatch.messages.findLastIndex(
        (msg: MessageDTO) => msg.id === id,
      );

      // If the message is not found, add it to the end of the group.
      if (messageMatchIndex === -1) {
        return [
          ...messagesCopy.slice(0, groupMatchIndex),
          {
            ...groupMatch,
            messages: [...groupMatch.messages, { ...message }],
          },
          ...messagesCopy.slice(groupMatchIndex + 1),
        ];
      }

      // Else, update the message by appending content.
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
      return [
        ...messagesCopy.slice(0, groupMatchIndex),
        updatedGroup,
        ...messagesCopy.slice(groupMatchIndex + 1),
      ];
    });

    // Update state
    if (activeConvId === convId) {
      set({ messagesByConv: newMessagesByConv, messages: newMessagesByConv.get(convId) || [] });
    } else {
      set({ messagesByConv: newMessagesByConv });
    }
  },

  deleteMessage: (convId: string, message: Partial<MessageDTO>) => {
    const { messagesByConv, activeConvId } = get();

    const newMessagesByConv = updateConvMessages(messagesByConv, convId, (messages) => {
      const { parent_id, id } = message;
      const messagesCopy = [...messages];

      // If parent_id is null, return the original messages.
      if (isNil(parent_id)) {
        return messagesCopy;
      }

      // Else, find the corresponding parent group.
      const groupMatchIndex = messagesCopy.findLastIndex((group) => group.id === parent_id);

      // If the parent group is not found, return the original messages.
      if (groupMatchIndex === -1) {
        return messagesCopy;
      }

      // Parent group found.
      const groupMatch = messagesCopy[groupMatchIndex];

      // Find the message index in the parent group.
      const messageMatchIndex = groupMatch.messages.findLastIndex(
        (msg: MessageDTO) => msg.id === id,
      );

      // If the message is not found, return the original messages.
      if (messageMatchIndex === -1) {
        return messagesCopy;
      }

      // Filter out the message to delete.
      const filteredMessages = groupMatch.messages.filter((msg: MessageDTO) => msg.id !== id);

      // If no messages left in the group, remove the entire group
      if (filteredMessages.length === 0) {
        return [
          ...messagesCopy.slice(0, groupMatchIndex),
          ...messagesCopy.slice(groupMatchIndex + 1),
        ];
      }

      // Else, update the group with filtered messages
      const updatedGroup = {
        ...groupMatch,
        messages: filteredMessages,
      };

      return [
        ...messagesCopy.slice(0, groupMatchIndex),
        updatedGroup,
        ...messagesCopy.slice(groupMatchIndex + 1),
      ];
    });

    // Update state
    if (activeConvId === convId) {
      set({ messagesByConv: newMessagesByConv, messages: newMessagesByConv.get(convId) || [] });
    } else {
      set({ messagesByConv: newMessagesByConv });
    }
  },

  setPreSendMessage: (message?: HumanMessageDTO) => set({ preSendMessage: message }),

  // Check if a conversation has cached messages
  hasMessages: (convId: string) => {
    const { messagesByConv } = get();
    const messages = messagesByConv.get(convId);
    return !!(messages && messages.length > 0);
  },
}));

// Export helper functions for backward compatibility
export const setMessagesData = (convId: string, messages: MessageDTO[]) =>
  useMessageStore.getState().setMessagesData(convId, messages);

export const hasMessages = (convId: string) => useMessageStore.getState().hasMessages(convId);

export const setActiveConv = (convId: string) => useMessageStore.getState().setActiveConv(convId);

export const updateOrAddMessage = (convId: string, message: MessageDTO) =>
  useMessageStore.getState().updateOrAddMessage(convId, message);

export const appendOrAddMessage = (convId: string, message: MessageDTO) =>
  useMessageStore.getState().appendOrAddMessage(convId, message);

export const deleteMessage = (convId: string, message: Partial<MessageDTO>) =>
  useMessageStore.getState().deleteMessage(convId, message);

export const setPreSendMessage = (message?: HumanMessageDTO) =>
  useMessageStore.getState().setPreSendMessage(message);
