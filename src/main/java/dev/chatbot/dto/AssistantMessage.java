package dev.chatbot.dto;

import lombok.Data;

@Data
public class AssistantMessage {
    private String sessionId;

    private String message;
}
