package dev.chatbot.dto;

import lombok.Data;

/**
 * DTO for AssistantMessage
 * 
 * @author zhoumo
 */
@Data
public class AssistantMessage {
    private String sessionId;

    private String message;
}
