package dev.chatbot.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.Objects;

@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    /**
     * The message id
     */
    private String id;

    /**
     * The message sender
     */
    private String from;

    /**
     * The message content
     */
    private String content;

    /**
     * The message send time
     */
    private long sendAt;

    /**
     * The message type
     */
    private String type;

    /**
     * The message additional kwargs
     */
    private Map<String, Objects> additionalKwargs;
}
