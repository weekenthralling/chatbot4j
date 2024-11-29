package dev.chatbot.controller;

import dev.chatbot.domain.Conversation;
import dev.chatbot.dto.ConversationDTO;
import dev.chatbot.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/conversation")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping("/")
    public ResponseEntity<Void> createConversation(@Validated @RequestBody ConversationDTO conversationDTO) {
        Conversation conversation = Conversation.builder()
                .title(conversationDTO.getTitle())
                .ragEnabled(conversationDTO.isRagEnabled())
                .build();
        conversationService.createNewConversation(conversation);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
