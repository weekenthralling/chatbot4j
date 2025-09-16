package dev.chatbot.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import dev.chatbot.domain.ChatHistory;
import dev.chatbot.domain.Conversation;
import dev.chatbot.domain.Share;
import dev.chatbot.dto.ConversationShare;
import dev.chatbot.exception.RecordNotFoundException;
import dev.chatbot.repository.ChatHistoryRepository;
import dev.chatbot.repository.ConversationRepository;
import dev.chatbot.repository.ShareRepository;

/**
 * ShareService is a service class that handles operations related to
 * sharing conversations.
 * It provides methods to save, delete, and retrieve shared
 * conversations.
 *
 * @author zhoumo
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareRepository shareRepository;
    private final ConversationRepository conversationRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    /**
     * save a share
     *
     * @param share share info
     * @param owner share owner
     * @param baseUrl base url
     */
    @Modifying
    @Transactional
    public Share saveShare(ConversationShare share, String owner, String baseUrl) {

        UUID conversationId = UUID.fromString(share.getSessionId());
        // check if the conversation exists
        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new RecordNotFoundException("Conversation not found"));

        // check if the conversation is archived
        if (conversation.getArchived()) {
            throw new IllegalArgumentException("Conversation is archived");
        }

        // check if the owner matches
        if (!conversation.getOwner().equals(owner)) {
            throw new IllegalArgumentException("You do not have permission to share this conversation");
        }

        ChatHistory history = chatHistoryRepository
                .findById(conversationId)
                .orElseThrow(() -> new RecordNotFoundException("Conversation message is empty"));

        UUID shareId = UUID.randomUUID();
        String url = baseUrl + "/share/" + shareId.toString();
        Share newShare = Share.builder()
                .id(shareId)
                .title(share.getTitle() != null ? share.getTitle() : conversation.getTitle())
                .owner(conversation.getOwner())
                .url(url)
                .snapshotRef(history.getMessage())
                .build();
        return this.shareRepository.save(newShare);
    }

    /**
     * delete a share by id and owner
     *
     * @param shareId share id
     * @param owner share owner
     */
    @Transactional
    @Modifying
    public void deleteShare(UUID shareId, String owner) {
        this.shareRepository.deleteByIdAndOwner(shareId, owner);
    }

    /**
     * get a share by id
     *
     * @param shareId share id
     * @return share
     */
    public Share getShare(UUID shareId) {
        return this.shareRepository.findById(shareId).orElseThrow(() -> new RecordNotFoundException("Share not found"));
    }

    /**
     * list shares by owner with pagination
     *
     * @param owner share owner
     * @param page page number
     * @param size page size
     * @return
     */
    public Page<Share> listShares(String owner, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return this.shareRepository.findByOwner(owner, pageable);
    }
}
