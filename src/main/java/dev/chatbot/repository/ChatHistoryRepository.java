package dev.chatbot.repository;

import dev.chatbot.domain.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * ChatHistoryRepository is a repository interface for the ChatHistory entity.
 * It extends JpaRepository to provide CRUD operations.
 * This interface is used to interact with the database and perform operations
 * related to chat history.
 * <p>
 * 
 * @author zhoumo
 */
@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, UUID> {
}
