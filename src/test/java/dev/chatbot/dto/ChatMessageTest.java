package dev.chatbot.dto;

import org.junit.jupiter.api.Test;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.ToolExecutionResultMessage;
import dev.langchain4j.data.message.UserMessage;

import static org.junit.jupiter.api.Assertions.*;

public class ChatMessageTest {
    @Test
    void testBuilderAndGetters() {
        // Test: build ChatMessage and verify fields
        ChatMessage msg = ChatMessage.builder()
                .id("123")
                .type("user")
                .content("Hello Copilot!")
                .build();
        assertEquals("123", msg.getId());
        assertEquals("user", msg.getType());
        assertEquals("Hello Copilot!", msg.getContent());
    }

    @Test
    void testFromLCSystemMessage() {
        SystemMessage sysMsg = new SystemMessage("System info");
        ChatMessage chatMsg = ChatMessage.fromLC(sysMsg);
        assertEquals("system", chatMsg.getType());
        assertEquals("System info", chatMsg.getContent());
    }

    @Test
    void testFromLCAiMessage() {
        AiMessage aiMsg = AiMessage.from("AI response");
        ChatMessage chatMsg = ChatMessage.fromLC(aiMsg);
        assertEquals("ai", chatMsg.getType());
        assertEquals("AI response", chatMsg.getContent());
    }

    @Test
    void testFromLCToolExecutionResultMessage() {
        ToolExecutionResultMessage toolMsg = new ToolExecutionResultMessage("tool-id", "ToolName", "Tool result");
        ChatMessage chatMsg = ChatMessage.fromLC(toolMsg);
        assertEquals("tool", chatMsg.getType());
        assertEquals("Tool result", chatMsg.getContent());
        assertEquals("tool-id", chatMsg.getId());
        assertTrue(chatMsg.getAdditionalKwargs().containsKey("toolName"));
    }

    @Test
    void testFromLCUserMessage() {
        UserMessage userMsg = UserMessage.from("User input");
        ChatMessage chatMsg = ChatMessage.fromLC(userMsg);
        assertEquals("human", chatMsg.getType());
        assertEquals("User input", chatMsg.getContent());
        assertTrue(chatMsg.getAdditionalKwargs().containsKey("artifacts"));
    }
}
