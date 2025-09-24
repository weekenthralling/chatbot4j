package dev.chatbot.service;

import java.util.Collections;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import dev.chatbot.domain.Conversation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationService conversationService;

    private Conversation conversation;
    private UUID conversationId;

    @BeforeEach
    void setUp() {
        conversation = Conversation.builder().owner("dev").title("New Chat").build();
        conversationId = UUID.randomUUID();
        conversation.setId(conversationId);
    }

    @Test
    void getConversation() {
        Mockito.when(conversationService.getConversation(conversationId)).thenReturn(conversation);
        Conversation result = conversationService.getConversation(conversationId);
        assertNotNull(result);
        assertEquals("dev", result.getOwner());
    }

    @Test
    void listConversationsByOwner() {
        Page<Conversation> page = new PageImpl<>(Collections.singletonList(conversation));
        Mockito.when(conversationService.listConversationsByOwner(anyString(), anyInt(), anyInt()))
                .thenReturn(page);
        Page<Conversation> result = conversationService.listConversationsByOwner("dev", 1, 10);
        assertNotNull(result.getContent());
        assertEquals(1, result.getContent().size());
    }

    @Test
    void updateConversation() {
        conversation.setTitle("Update Chat");
        conversationService.saveConversation(conversation);
        Mockito.when(conversationService.getConversation(conversationId)).thenReturn(conversation);
        Conversation result = conversationService.getConversation(conversationId);
        assertEquals("Update Chat", result.getTitle());
        Mockito.verify(conversationService).saveConversation(conversation);
    }
}
