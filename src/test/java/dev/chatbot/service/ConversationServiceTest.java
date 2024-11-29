package dev.chatbot.service;

import dev.chatbot.ChatBotApplication;
import dev.chatbot.domain.Conversation;
import dev.chatbot.vo.PageBean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

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

        this.conversationService.createNewConversation(conversation);
        conversationId = conversation.getId();
    }

    @Test
    void getConversation() {
        Conversation conversation = conversationService.getConversation(conversationId.toString());
        assertNotNull(conversation);
        assertNotNull(conversation.getArchived());
    }

    @Test
    void listConversationsByOwner() {
        PageBean<Conversation> pageBean = conversationService.listConversationsByOwner("dev", 1, 10);
        assertEquals(1, pageBean.getPageNo());
        assertEquals(10, pageBean.getPageSize());
        assertNotNull(pageBean.getList());
    }

    @Test
    void updateConversation() {
        Conversation conversation = conversationService.getConversation(conversationId.toString());
        conversation.setTitle("Update Chat");
        conversationService.updateConversation(conversation);
        Conversation updatedConversation = conversationService.getConversation(conversationId.toString());
        assertEquals("Update Chat", updatedConversation.getTitle());
    }

    @Test
    void deleteConversation() {
        conversationService.deleteConversation(conversationId.toString());
        Conversation conversation = conversationService.getConversation(conversationId.toString());
        assertNull(conversation);
    }
}