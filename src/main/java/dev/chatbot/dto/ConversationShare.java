package dev.chatbot.dto;

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
     * conversation session id
     */
    @NotEmpty private String sessionId;
}
