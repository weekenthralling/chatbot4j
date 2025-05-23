package dev.chatbot.vo;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.AudioContent;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageType;
import dev.langchain4j.data.message.Content;
import dev.langchain4j.data.message.ContentType;
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
 * Message is a class that represents a message in the chat application.
 * It contains the content of the message, the role of the sender (user or assistant),
 * and any additional metadata associated with the message.
 *
 * @author zhoumo
 */
@Slf4j
@Getter
@Builder
public class Message {

    /**
     * The content of the message
     */
    private Object content;

    /**
     * The role of the sender (user or ai)
     */
    private String role;

    /**
     * The metadata associated with the message
     */
    private Map<String, Object> metadata;

    /**
     * Converts a ChatMessage to a Message.
     * This method uses `messageType` to determine the type of the message.
     * It then casts the message to the appropriate type and extracts the content.
     * Finally, it creates a new Message object with the extracted content and role.
     *
     * @param message the chat message to be converted
     * @return Message
     */
    public static Message fromChatMessage(ChatMessage message) {
        final ChatMessageType messageType = message.type();
        switch (messageType) {
            case SYSTEM -> {
                SystemMessage systemMessage = (SystemMessage) message;
                return Message.builder()
                        .content(systemMessage.text())
                        .role("system")
                        .build();
            }
            case AI -> {
                AiMessage aiMessage = (AiMessage) message;
                List<Map<String, String>> tools = aiMessage.toolExecutionRequests().stream()
                        .map(tool -> Map.of(
                                "id", tool.id(),
                                "name", tool.name(),
                                "arguments", tool.arguments()))
                        .toList();

                return Message.builder()
                        .content(aiMessage.text())
                        .role("ai")
                        .metadata(Map.of("tool_calls", tools))
                        .build();
            }
            case USER -> {
                UserMessage userMessage = (UserMessage) message;
                Map<String, Object> metadata = userMessage.contents().stream()
                        .map(Message::convertContent)
                        .filter(Objects::nonNull)
                        .flatMap(content -> content.entrySet().stream())
                        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (v1, v2) -> v2));

                String text = metadata.getOrDefault("text", "").toString();
                return Message.builder()
                        .content(text)
                        .metadata(metadata)
                        .role("user")
                        .build();
            }
            case TOOL_EXECUTION_RESULT -> {
                ToolExecutionResultMessage toolMessage = (ToolExecutionResultMessage) message;
                return Message.builder()
                        .content(toolMessage.text())
                        .role("tool")
                        .metadata(Map.of("toolName", toolMessage.toolName(), "id", toolMessage.id()))
                        .build();
            }
            default -> {
                log.error("Unsupported message type: {}", messageType);
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
        final ContentType contentType = content.type();
        switch (contentType) {
            case TEXT -> {
                TextContent textContent = (TextContent) content;
                return Map.of("text", textContent.text());
            }
            case IMAGE -> {
                ImageContent imageContent = (ImageContent) content;
                return Map.of("image", imageContent.image().base64Data());
            }
            case AUDIO -> {
                AudioContent audioContent = (AudioContent) content;
                return Map.of("audio", audioContent.audio().base64Data());
            }
            case VIDEO -> {
                VideoContent videoContent = (VideoContent) content;
                return Map.of("video", videoContent.video().base64Data());
            }
            case PDF -> {
                PdfFileContent fileContent = (PdfFileContent) content;
                return Map.of("pdf", fileContent.pdfFile().base64Data());
            }
            default -> {
                log.error("Unsupported content type: {}", contentType);
                return null;
            }
        }
    }
}
