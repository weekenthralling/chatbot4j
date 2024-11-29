package dev.chatbot.repository;

import dev.chatbot.domain.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * @author zhoumo
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * delete conversation by id
     * @param id conv id
     */
    void deleteById(UUID id);

    /**
     * find conversation by id
     * @param id conv id
     * @return Conversation
     */
    Conversation findById(UUID id);

    /**
     * list conversation by owner
     * @param owner name
     * @return list of conv
     */
    Page<Conversation> findByOwner(String owner, Pageable pageable);
}
