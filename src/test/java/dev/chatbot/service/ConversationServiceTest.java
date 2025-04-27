package dev.chatbot.service;

import dev.chatbot.ChatBotApplication;
import dev.chatbot.domain.Conversation;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * ConversationServiceTest is a test class for testing the ConversationService class
 * @author zhoumo
 */
@SpringBootTest(classes = ChatBotApplication.class)
class ConversationServiceTest {

    @Autowired
    private ConversationService conversationService;

    private UUID conversationId;

    @BeforeEach
    void setUp() {
        Conversation conversation = Conversation.builder()
                .owner("dev")
                .title("New Chat")
                .build();

        this.conversationService.saveConversation(conversation);
        conversationId = conversation.getId();
    }

    @AfterEach
    void tearDown() {
        conversationService.deleteConversation(conversationId);
    }

    @Test
    void getConversation() {
        Conversation conversation = conversationService.getConversation(conversationId);
        assertNotNull(conversation);
    }

    @Test
    void listConversationsByOwner() {
        Page<Conversation> page = conversationService.listConversationsByOwner("dev", 1, 10);
        assertNotNull(page.getContent());
    }

    @Test
    void updateConversation() {
        Conversation conversation = conversationService.getConversation(conversationId);
        conversation.setTitle("Update Chat");
        conversationService.saveConversation(conversation);
        assertEquals("Update Chat", conversation.getTitle());
    }
}
