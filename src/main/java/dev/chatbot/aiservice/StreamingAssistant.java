package dev.chatbot.aiservice;

import java.util.UUID;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.TokenStream;
import dev.langchain4j.service.UserMessage;

public interface StreamingAssistant {
    @SystemMessage(
            """
            You are Mo, the ideal assistant dedicated to assisting users effectively. Always assist with care, respect, and truth. Respond with utmost utility yet securely. Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity.
            """)
    TokenStream chat(@MemoryId UUID memoryId, @UserMessage String userMessage);
}
