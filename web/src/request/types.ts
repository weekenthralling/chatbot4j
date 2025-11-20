export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total?: number;
  pages?: number;
}

export interface CursorPage<T> {
  items: T[];
  total?: number;
  current_page?: string;
  current_page_backwards?: string;
  previous_page?: string;
  next_page?: string;
}

export interface UserInfo {
  userid: string;
  username: string;
  email: string;
}

export interface FileMeta {
  url: string;
  filename: string;
  mimetype?: string;
  size?: number;
}

export type FeedbackRating = "thumbsUp" | "thumbsDown" | undefined;
export interface FeedbackDTO {
  rating?: FeedbackRating;
  comment?: string;
  score?: number;
  labels?: Record<string, any>;
}

export interface MessageDTO {
  id: string;
  parent_id?: string;
  from?: string; // username. Could be null when we are constructing it from sub-components which does not have user info.
  content: string;
  reasoning?: string; // Store AI's reasoning for the response
  type: string;
  sent_at: string;
  additional_kwargs?: any;
}

export interface HumanMessageDTO extends MessageDTO {
  type: "human";
  attachments?: any[];
  additional_kwargs?: Partial<{
    model: string; // used to select a model
    require_summarization?: boolean;
  }>;
}

export interface AIMessageDTO extends MessageDTO {
  type: "ai" | "AIMessageChunk";
  tool_calls: any[];
  additional_kwargs?: Partial<{
    feedback: FeedbackDTO;
    model: string;
    raw_content?: string;
  }>;
}

export interface ToolMessageDTO extends MessageDTO {
  type: "tool" | "ToolMessageChunk";
  artifacts: any[];
}

/**
 * Group messages according to their parent_id.
 * Each group has an id and a list of messages.
 * The group id is the parent id of the messages in the group.
 * If the message have no parent, then the group id is the id of the message.
 */
export interface GroupMessagesDTO {
  id: string;
  messages?: MessageDTO[];
}

export interface ConversationDTO {
  id: string;
  title: string;
  owner?: string;
  last_message_at?: string;
  created_at?: string;
  pinned?: boolean;
  messages: MessageDTO[];
}

export interface ShareDTO {
  id?: string;
  title: string;
  url: string;
  messages: MessageDTO[];
  created_at: string;
}

export interface ModelDTO {
  id: string[];
  kwargs: Record<string, any>;
  lc: number;
  name: string;
  type: string;
}
