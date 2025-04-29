package dev.chatbot.vo;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

import dev.langchain4j.data.message.ChatMessage;

@Getter
@Builder
public class Chat {

    /**
     * The conversion id
     */
    private String id;

    /**
     * The title of the conversation
     */
    private String title;

    /**
     * The owner of the conversation
     */
    private String owner;

    /**
     * The conversation update time
     */
    private Instant updatedAt;

    /**
     * messages of the conversation
     */
    private List<ChatMessage> messages;
}
