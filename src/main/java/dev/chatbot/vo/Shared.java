package dev.chatbot.vo;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Getter;

import dev.chatbot.dto.ChatMessage;

@Getter
@Builder
public class Shared {

    /**
     * share id
     */
    private UUID id;

    /**
     * share title
     */
    private String title;

    /**
     * share owner
     */
    private String owner;

    /**
     * share url
     */
    private String url;

    /**
     * share messages
     */
    private List<ChatMessage> messages;

    /**
     * share created time
     */
    @JsonProperty("created_at")
    private Instant createdAt;
}
