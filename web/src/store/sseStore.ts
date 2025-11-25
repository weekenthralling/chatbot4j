import { create } from "zustand";

interface SSEConnection {
  convId: string;
  abortController: AbortController;
  reader: ReadableStreamDefaultReader<Uint8Array>;
  isActive: boolean;
  messageHandler: (message: any) => void; // Store the message handler for this specific conversation
}

interface SSEState {
  // Map of convId to SSE connection
  connections: Map<string, SSEConnection>;
  // Map of convId to answering state
  answeringStates: Map<string, boolean>;
  // Map of convId to unread completion state (completed but not viewed)
  unreadCompletions: Map<string, boolean>;

  // Get if a conversation is currently receiving messages
  isAnswering: (convId: string) => boolean;
  // Set answering state for a conversation
  setAnswering: (convId: string, answering: boolean) => void;
  // Get if a conversation has unread completion
  hasUnreadCompletion: (convId: string) => boolean;
  // Mark conversation as completed but unread
  markAsCompleted: (convId: string) => void;
  // Clear unread completion status (called when user views the conversation)
  clearUnreadCompletion: (convId: string) => void;
  // Track the currently active conversation globally
  activeConvId: string | null;
  setActiveConvId: (convId: string) => void;
  getActiveConvId: () => string | null;

  // Add a new SSE connection
  addConnection: (
    convId: string,
    abortController: AbortController,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    messageHandler: (message: any) => void,
  ) => void;

  // Remove and abort a connection
  removeConnection: (convId: string) => void;

  // Get connection for a conversation
  getConnection: (convId: string) => SSEConnection | undefined;

  // Abort all connections (for cleanup)
  abortAll: () => void;
}

export const useSSEStore = create<SSEState>()((set, get) => ({
  connections: new Map(),
  answeringStates: new Map(),
  unreadCompletions: new Map(),
  activeConvId: null,
  setActiveConvId: (convId: string) => {
    set({ activeConvId: convId });
  },
  getActiveConvId: () => get().activeConvId,

  isAnswering: (convId: string) => {
    return get().answeringStates.get(convId) ?? false;
  },

  setAnswering: (convId: string, answering: boolean) => {
    set((state) => {
      const newStates = new Map(state.answeringStates);
      newStates.set(convId, answering);
      return { answeringStates: newStates };
    });
  },

  hasUnreadCompletion: (convId: string) => {
    return get().unreadCompletions.get(convId) ?? false;
  },

  markAsCompleted: (convId: string) => {
    set((state) => {
      const newCompletions = new Map(state.unreadCompletions);
      newCompletions.set(convId, true);
      return { unreadCompletions: newCompletions };
    });
  },

  clearUnreadCompletion: (convId: string) => {
    set((state) => {
      const newCompletions = new Map(state.unreadCompletions);
      newCompletions.delete(convId);
      return { unreadCompletions: newCompletions };
    });
  },

  addConnection: (
    convId: string,
    abortController: AbortController,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    messageHandler: (message: any) => void,
  ) => {
    // Remove existing connection if any
    get().removeConnection(convId);

    set((state) => {
      const newConnections = new Map(state.connections);
      newConnections.set(convId, {
        convId,
        abortController,
        reader,
        isActive: true,
        messageHandler,
      });
      return { connections: newConnections };
    });
  },

  removeConnection: (convId: string) => {
    const connection = get().connections.get(convId);
    if (connection) {
      try {
        // Only abort the controller, let the read loop handle reader cleanup
        connection.abortController.abort();
      } catch (error) {
        console.warn(`Error aborting connection for ${convId}:`, error);
      }
    }

    set((state) => {
      const newConnections = new Map(state.connections);
      newConnections.delete(convId);
      return { connections: newConnections };
    });

    // Also clear answering state
    set((state) => {
      const newStates = new Map(state.answeringStates);
      newStates.set(convId, false);
      return { answeringStates: newStates };
    });
  },

  getConnection: (convId: string) => {
    return get().connections.get(convId);
  },

  abortAll: () => {
    const connections = get().connections;
    connections.forEach((connection) => {
      try {
        // Only abort, let the read loops handle cleanup
        connection.abortController.abort();
      } catch (error) {
        console.warn(`Error aborting connection:`, error);
      }
    });

    set({ connections: new Map(), answeringStates: new Map() });
  },
}));
