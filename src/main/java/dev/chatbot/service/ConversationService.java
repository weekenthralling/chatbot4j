package dev.chatbot.service;

import dev.chatbot.domain.Conversation;
import dev.chatbot.repository.ConversationRepository;
import dev.chatbot.vo.PageBean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * create a new conversation
     * @param conversation conversation entity
     */
    public void createNewConversation(Conversation conversation) {
        this.conversationRepository.save(conversation);
    }

    /**
     * get a conversation by id
     * @param convId conversation id
     * @return conversation entity
     */
    public Conversation getConversation(String convId) {
        return this.conversationRepository.findById(UUID.fromString(convId));
    }

    /**
     * delete a conversation by id
     * @param convId conversation id
     */
    @Transactional
    @Modifying
    public void deleteConversation(String convId) {
        this.conversationRepository.deleteById(UUID.fromString(convId));
    }

    /**
     * list all conversations by owner
     * @param owner owner name
     * @return list of conversation entities
     */
    public PageBean<Conversation> listConversationsByOwner(String owner, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<Conversation> conversations = this.conversationRepository.findByOwner(owner, pageable);
        if (conversations.getContent().isEmpty()) {
            return PageBean.emptyPage(page, size);
        }
        return PageBean.of(page, size, conversations.getTotalElements(), conversations.getContent());
    }

    /**
     * update a conversation
     * @param conversation conversation entity
     */
    @Transactional
    @Modifying
    public void updateConversation(Conversation conversation) {
        this.conversationRepository.save(conversation);
    }
}
