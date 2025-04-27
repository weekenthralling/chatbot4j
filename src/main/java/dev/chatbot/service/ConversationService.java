package dev.chatbot.service;

import dev.chatbot.domain.Conversation;
import dev.chatbot.exception.RecordNotFoundException;
import dev.chatbot.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * @author zhoumo
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;

    /**
     * get a conversation by id
     *
     * @param convId conversation id
     * @return conversation entity
     */
    public Conversation getConversation(UUID convId) {
        Optional<Conversation> optional = this.conversationRepository.findById(convId);
        if (optional.isEmpty()) {
            throw new RecordNotFoundException("No conversation found");
        }

        if (optional.get().getArchived()) {
            throw new RecordNotFoundException("Conversation is archived");
        }
        return optional.get();
    }

    /**
     * delete a conversation by id
     *
     * @param convId conversation id
     */
    @Transactional
    @Modifying
    public void deleteConversation(UUID convId) {
        this.conversationRepository.deleteById(convId);
    }

    /**
     * list all conversations by owner
     *
     * @param owner owner name
     * @return list of conversation entities
     */
    public Page<Conversation> listConversationsByOwner(String owner, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        return this.conversationRepository.findByOwnerAndArchived(owner, false, pageable);
    }

    /**
     * create or update a conversation
     *
     * @param conversation conversation entity
     */
    @Transactional
    @Modifying
    public void saveConversation(Conversation conversation) {
        this.conversationRepository.save(conversation);
    }
}
