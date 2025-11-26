package dev.chatbot.aiservice;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

public interface SummaryAssistant {

    @SystemMessage(fromResource = "prompts/summarize_assistant_prompt.txt")
    String summarize(@UserMessage String conversation);
}
