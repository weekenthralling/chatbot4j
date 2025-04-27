package dev.chatbot.aiservice;

import dev.chatbot.domain.ChatHistory;
import dev.chatbot.repository.ChatHistoryRepository;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.store.memory.chat.ChatMemoryStore;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
 * @author zhoumo
 */
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
        return messagesFromJson(chatHistory.get().getMessage());
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        String chatMessages = messagesToJson(messages);
        ChatHistory chatHistory = chatHistoryRepository.findById((UUID) memoryId)
                .orElseGet(
                        () -> ChatHistory.builder()
                                .id((UUID) memoryId)
                                .archived(false)
                                .build()
                );
        chatHistory.setMessage(chatMessages);
        chatHistoryRepository.save(chatHistory);
    }

    @Override
    public void deleteMessages(Object memoryId) {
        chatHistoryRepository.deleteById((UUID) memoryId);
    }
}
