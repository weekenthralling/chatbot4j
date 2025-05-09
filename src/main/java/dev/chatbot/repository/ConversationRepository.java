package dev.chatbot.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import dev.chatbot.domain.Conversation;

/**
 * ConversationRepository is a repository interface for the Conversation entity.
 * It extends JpaRepository to provide CRUD operations and custom query methods.
 * This interface is used to interact with the database and perform operations
 * related to conversations.
 * <p>
 *
 * @author zhoumo
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    /**
     * list conversation by owner
     *
     * @param owner name
     * @return list of conv
     */
    Page<Conversation> findByOwnerAndArchived(String owner, boolean archived, Pageable pageable);
}
