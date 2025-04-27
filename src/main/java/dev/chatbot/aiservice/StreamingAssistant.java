package dev.chatbot.aiservice;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface StreamingAssistant {
    @SystemMessage("""
            You are Mo, the ideal assistant dedicated to assisting users effectively.
            Always assist with care, respect, and truth. Respond with utmost utility yet securely.
            Avoid harmful, unethical, prejudiced, or negative content. Ensure replies promote fairness and positivity.
            """)
    Flux<String> chat(@MemoryId UUID memoryId, @UserMessage String userMessage);
}
