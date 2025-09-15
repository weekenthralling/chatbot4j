package dev.chatbot.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessageType;
import dev.langchain4j.data.message.CustomMessage;
import dev.langchain4j.data.message.SystemMessage;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

/**
 * DTO for AssistantMessage
 *
 * @author zhoumo
 */
@Setter
@Getter
@Slf4j
@Builder
public class ChatMessage {

    /**
     * The unique identifier of the message.
     * Note: This field may be unused now.
     */
    private String id;

    /**
     * The identifier of the parent message (if any).
     * For ai messages, this is the id of the user message that prompted it.
     */
    @JsonProperty("parent_id")
    private String parentId;

    /**
     * The sender of the message, e.g., "dev" or other user identifier.
     * Note: This field may be unused now.
     */
    private String from;

    /**
     * The timestamp when the message was sent.
     * Note: This field may be unused now.
     */
    @JsonProperty("send_at")
    private Instant sendAt;

    /**
     * The type of the message, e.g., "human", "ai", etc.
     * Note: This field may be unused now.
     */
    private String type;

    /**
     * The content of the message.
     */
    private String content;

    /**
     * Additional keyword arguments for the message.
     */
    @JsonProperty("additional_kwargs")
    private Map<String, Object> additionalKwargs;

    /**
     * Convert from langchain4j ChatMessage to our ChatMessage DTO.
     * @param lcMessage the langchain4j ChatMessage
     * @return the converted ChatMessage DTO
     */
    public static ChatMessage fromLC(dev.langchain4j.data.message.ChatMessage lcMessage) {
        final ChatMessageType messageType = lcMessage.type();
        switch (messageType) {
            case SYSTEM -> {
                SystemMessage systemMessage = (SystemMessage) lcMessage;
                return ChatMessage.builder()
                        .content(systemMessage.text())
                        .type("system")
                        .build();
            }
            case AI -> {
                AiMessage aiMessage = (AiMessage) lcMessage;
                List<Map<String, String>> tools = aiMessage.toolExecutionRequests().stream()
                        .map(tool -> Map.of(
                                "id", tool.id(),
                                "name", tool.name(),
                                "arguments", tool.arguments()))
                        .toList();

                Map<String, Object> attributes = aiMessage.attributes();
                return ChatMessage.builder()
                        .content(aiMessage.text())
                        .type("ai")
                        .id(attributes.get("id").toString())
                        .parentId(attributes.get("parentId").toString())
                        .sendAt(Instant.ofEpochMilli((long) attributes.get("sendAt")))
                        .additionalKwargs(Map.of("tool_calls", tools))
                        .build();
            }
            case CUSTOM -> {
                CustomMessage customMessage = (CustomMessage) lcMessage;
                Map<String, Object> attributes = customMessage.attributes();
                return ChatMessage.builder()
                        .content(attributes.get("content").toString())
                        .type(attributes.get("type").toString())
                        .id(attributes.get("id").toString())
                        // User message may not have parentId
                        .parentId(attributes.getOrDefault("parentId", "").toString())
                        .sendAt(Instant.ofEpochMilli((long) attributes.get("sendAt")))
                        .additionalKwargs(customMessage.attributes())
                        .build();
            }
            default -> {
                log.error("Unsupported message type: {}", messageType);
                return null;
            }
        }
    }
}
