package dev.chatbot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * DTO for sharing a conversation
 *
 * @author zhoumo
 */
@Data
public class ConversationShare {

    /**
     * share title
     */
    private String title;

    /**
     * conversation session id
     */
    @NotEmpty @JsonProperty("source_id")
    private String sessionId;
}
