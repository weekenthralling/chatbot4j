package dev.chatbot.service;

import dev.chatbot.domain.ChatHistory;
import dev.chatbot.domain.Conversation;
import dev.chatbot.domain.Share;
import dev.chatbot.dto.ConversationShare;
import dev.chatbot.exception.RecordNotFoundException;
import dev.chatbot.repository.ChatHistoryRepository;
import dev.chatbot.repository.ConversationRepository;
import dev.chatbot.repository.ShareRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
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
     * @param share
     */
    @Modifying
    @Transactional
    public void saveShare(ConversationShare share) {

        UUID conversationId = UUID.fromString(share.getSessionId());
        // check if the conversation exists
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RecordNotFoundException("Conversation not found"));

        // check if the conversation is archived
        if (conversation.getArchived()) {
            throw new IllegalArgumentException("Conversation is archived");
        }

        ChatHistory history = chatHistoryRepository.findById(conversationId)
                .orElseThrow(() -> new RecordNotFoundException("Conversation message is empty"));

        // TODO: Replace with actual URL generation logic
        String url = "https://example.com/share/" + conversationId;
        Share newShare = Share.builder()
                .title(conversation.getTitle())
                .owner(conversation.getOwner())
                .url(url)
                .snapshotRef(history.getMessage())
                .build();
        shareRepository.save(newShare);
    }

    /**
     * delete a share by id
     * @param shareId
     */
    @Transactional
    @Modifying
    public void deleteShare(UUID shareId) {
        shareRepository.deleteById(shareId);
    }

    /**
     * get a share by id
     * 
     * @param shareId
     * @return
     */
    public Share getShare(UUID shareId) {
        return shareRepository.findById(shareId)
                .orElseThrow(() -> new RecordNotFoundException("Share not found"));
    }
}
