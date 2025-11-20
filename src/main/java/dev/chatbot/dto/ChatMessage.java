package dev.chatbot.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.AudioContent;
import dev.langchain4j.data.message.Content;
import dev.langchain4j.data.message.ImageContent;
import dev.langchain4j.data.message.PdfFileContent;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.TextContent;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.data.message.VideoContent;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * DTO for AssistantMessage
 *
 * @author zhoumo
 */
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
    @JsonProperty("sent_at")
    private Instant sentAt;

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
     * The reasoning/thinking process of the AI (if any).
     */
    private String reasoning;

    /**
     * Additional keyword arguments for the message.
     */
    @JsonProperty("additional_kwargs")
    private Map<String, Object> additionalKwargs;

    @JsonCreator
    public ChatMessage(
            @JsonProperty("id") String id,
            @JsonProperty("parent_id") String parentId,
            @JsonProperty("from") String from,
            @JsonProperty("sent_at") Instant sentAt,
            @JsonProperty("type") String type,
            @JsonProperty("content") String content,
            @JsonProperty("reasoning") String reasoning,
            @JsonProperty("additional_kwargs") Map<String, Object> additionalKwargs) {
        this.id = id;
        this.parentId = parentId;
        this.from = from;
        this.sentAt = sentAt;
        this.type = type;
        this.content = content;
        this.reasoning = reasoning;
        this.additionalKwargs = additionalKwargs;
    }

    /**
     * Convert from langchain4j ChatMessage to our ChatMessage DTO.
     * @param lcMessage the langchain4j ChatMessage
     * @return the converted ChatMessage DTO
     */
    public static ChatMessage fromLC(dev.langchain4j.data.message.ChatMessage lcMessage) {
        switch (lcMessage) {
            case SystemMessage systemMessage -> {
                return ChatMessage.builder()
                        .content(systemMessage.text())
                        .type("system")
                        .build();
            }
            case AiMessage aiMessage -> {
                List<Map<String, String>> tools = aiMessage.toolExecutionRequests().stream()
                        .map(tool -> Map.of(
                                "id", tool.id(),
                                "name", tool.name(),
                                "arguments", tool.arguments()))
                        .toList();

                // Use text directly as content
                String content = aiMessage.text() != null ? aiMessage.text() : "";
                // Use thinking directly as reasoning
                String reasoning = aiMessage.thinking() != null ? aiMessage.thinking() : "";

                // Map<String, Object> attributes = aiMessage.attributes();
                return ChatMessage.builder()
                        .content(content)
                        .reasoning(reasoning) // Store thinking in reasoning field
                        .type("ai")
                        // .id(attributes.get("id").toString())
                        // .parentId(attributes.get("parentId").toString())
                        // .sendAt(Instant.ofEpochMilli((long) attributes.get("sendAt")))
                        .additionalKwargs(Map.of("tool_calls", tools))
                        .build();
            }
            case ToolExecutionResultMessage toolExecutionResultMessage -> {
                return ChatMessage.builder()
                        .content(toolExecutionResultMessage.text())
                        .id(toolExecutionResultMessage.id())
                        .type("tool")
                        .additionalKwargs(Map.of("toolName", toolExecutionResultMessage.toolName()))
                        .build();
            }
            case UserMessage userMessage -> {
                Map<String, Object> metadata = userMessage.contents().stream()
                        .map(ChatMessage::convertContent)
                        .filter(Objects::nonNull)
                        .flatMap(content -> content.entrySet().stream())
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (v1, v2) -> v2));

                return ChatMessage.builder()
                        .content(userMessage.singleText())
                        .type("human")
                        .additionalKwargs(Map.of("artifacts", metadata))
                        .build();
            }
            default -> {
                log.error("Unsupported message type: {}", lcMessage.type());
                return null;
            }
        }
    }

    /**
     * Converts a Content object to a Map<String, Object>.
     * This method uses `contentType` to determine the type of the content.
     * It then casts the content to the appropriate type and extracts the relevant data.
     * Finally, it creates a new Map<String, Object> with the extracted data.
     *
     * @param content the content to be converted
     * @return Map<String, Object>
     */
    private static Map<String, Object> convertContent(Content content) {
        switch (content) {
            case TextContent textContent -> {
                return Map.of("text", textContent.text());
            }
            case ImageContent imageContent -> {
                return Map.of("image", imageContent.image().base64Data());
            }
            case AudioContent audioContent -> {
                return Map.of("audio", audioContent.audio().base64Data());
            }
            case VideoContent videoContent -> {
                return Map.of("video", videoContent.video().base64Data());
            }
            case PdfFileContent pdfFileContent -> {
                return Map.of("pdf", pdfFileContent.pdfFile().base64Data());
            }
            default -> {
                log.error("Unsupported content type: {}", content.type());
                return null;
            }
        }
    }
}
