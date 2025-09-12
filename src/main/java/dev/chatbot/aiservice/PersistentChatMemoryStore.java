package dev.chatbot.aiservice;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.ChatMessageType;
import dev.langchain4j.data.message.CustomMessage;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import lombok.extern.slf4j.Slf4j;

import dev.chatbot.domain.ChatHistory;
import dev.chatbot.repository.ChatHistoryRepository;

import static dev.langchain4j.data.message.ChatMessageDeserializer.messagesFromJson;
import static dev.langchain4j.data.message.ChatMessageSerializer.messagesToJson;

/**
 * PersistentChatMemoryStore is a persistent store for chat messages.
 * It uses a database to store chat messages and retrieve them when needed.
 * This class implements the ChatMemoryStore interface.
 * <p>
 * The class provides methods to get, update, and delete chat messages.
 * It uses the ChatHistoryRepository to interact with the database.
 * <p>
 *
 * @author zhoumo
 */
@Slf4j
@Component
public class PersistentChatMemoryStore implements ChatMemoryStore {

    private final ChatHistoryRepository chatHistoryRepository;

    public PersistentChatMemoryStore(ChatHistoryRepository chatHistoryRepository) {
        this.chatHistoryRepository = chatHistoryRepository;
    }

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        Optional<ChatHistory> chatHistory = chatHistoryRepository.findById((UUID) memoryId);
        if (chatHistory.isEmpty()) {
            return List.of();
        }
        /**
         * We use the `CustomMessage` class to represent user messages and tool execution results messages.
         * We have store additional metadata about the messages, such as their IDs and timestamps.
         * We should convert them to real UserMessage and ToolExecutionResultMessage objects when request for ChatModel.
         */
        List<ChatMessage> chatMessages = messagesFromJson(chatHistory.get().getMessage());
        return chatMessages.stream()
                .map(message -> {
                    if (message.type() == ChatMessageType.CUSTOM) {
                        CustomMessage customMessage = (CustomMessage) message;
                        Map<String, Object> attributes = customMessage.attributes();
                        String type = (String) attributes.get("type");
                        log.debug("Convert CustomMessage type: {}", type);
                        if ("user".equals(type)) {
                            // Convert CustomMessage to UserMessage
                            // TODO: only single text for now.
                            message = UserMessage.from((String) attributes.get("content"));
                        } else if ("tool".equals(type)) {
                            // Convert CustomMessage to ToolExecutionResultMessage
                            message = ToolExecutionResultMessage.from(
                                    (String) attributes.get("id"), (String) attributes.get("toolName"), (String)
                                            attributes.get("content"));
                        }
                    }
                    return message;
                })
                .toList();
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        /**
         * NOTE: Here we do some processing on the last message to ensure that
         * it has a unique ID and a timestamp. We also convert certain message
         * types to CustomMessage to ensure that they have the necessary attributes.
         *
         */
        ChatMessage lastMessage = messages.get(messages.size() - 1);

        // Here we use the persisted history instead of the passed in messages,
        // because in the persisted history, UserMessage and ToolExecutionResultMessage
        // have been converted to CustomMessage, which contains more metadata.
        messages = chatHistoryRepository
                .findById((UUID) memoryId)
                .map(chatHistory -> {
                    return messagesFromJson(chatHistory.getMessage());
                })
                .orElseGet(ArrayList::new);

        switch (lastMessage.type()) {
            case USER: {
                UserMessage userMessage = (UserMessage) lastMessage;
                Map<String, Object> attributes = Map.of(
                        "id", UUID.randomUUID().toString(),
                        "content", userMessage.singleText(),
                        "contents", userMessage.contents(),
                        "type", "user",
                        "sendAt", Instant.now().toEpochMilli());
                lastMessage = CustomMessage.from(attributes);
                break;
            }
            case AI: {
                AiMessage aiMessage = (AiMessage) lastMessage;
                String parentId = messages.stream()
                        .filter(msg -> msg.type() == ChatMessageType.CUSTOM)
                        .map(msg -> (CustomMessage) msg)
                        .filter(customMsg ->
                                "user".equals(customMsg.attributes().get("type")))
                        .reduce((first, second) -> second)
                        .map(customMsg -> (String) customMsg.attributes().get("id"))
                        .orElse(null);

                Map<String, Object> attributes = Map.of(
                        "id", UUID.randomUUID().toString(),
                        "sendAt", Instant.now().toEpochMilli(),
                        "parentId", parentId);
                lastMessage = AiMessage.builder()
                        .text(aiMessage.text())
                        .thinking(aiMessage.thinking())
                        .toolExecutionRequests(aiMessage.toolExecutionRequests())
                        .attributes(attributes)
                        .build();
                break;
            }
            case TOOL_EXECUTION_RESULT: {
                ToolExecutionResultMessage toolExecutionResultMessage = (ToolExecutionResultMessage) lastMessage;
                String parentId = messages.stream()
                        .filter(msg -> msg.type() == ChatMessageType.CUSTOM)
                        .map(msg -> (CustomMessage) msg)
                        .filter(customMsg ->
                                "user".equals(customMsg.attributes().get("type")))
                        .reduce((first, second) -> second)
                        .map(customMsg -> (String) customMsg.attributes().get("id"))
                        .orElse(null);

                Map<String, Object> attributes = Map.of(
                        "id", toolExecutionResultMessage.id(),
                        "toolName", toolExecutionResultMessage.toolName(),
                        "content", toolExecutionResultMessage.text(),
                        "type", "tool",
                        "sendAt", Instant.now().toEpochMilli(),
                        "parentId", parentId);
                lastMessage = CustomMessage.from(attributes);
                break;
            }
            default:
                log.debug("No processing required message type: {}", lastMessage.type());
                break;
        }
        messages.add(lastMessage);
        String chatMessages = messagesToJson(messages);
        ChatHistory chatHistory = chatHistoryRepository
                .findById((UUID) memoryId)
                .orElseGet(() -> ChatHistory.builder()
                        .id((UUID) memoryId)
                        .archived(false)
                        .build());
        chatHistory.setMessage(chatMessages);
        chatHistoryRepository.save(chatHistory);
    }

    @Override
    public void deleteMessages(Object memoryId) {
        chatHistoryRepository.deleteById((UUID) memoryId);
    }
}
