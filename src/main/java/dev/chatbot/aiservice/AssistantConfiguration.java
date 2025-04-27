package dev.chatbot.aiservice;

import dev.chatbot.properties.LLMProperties;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.service.AiServices;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

import static org.springframework.beans.factory.config.ConfigurableBeanFactory.SCOPE_PROTOTYPE;

@Configuration
@RequiredArgsConstructor
public class AssistantConfiguration {

    private final LLMProperties llmProperties;

    private final PersistentChatMemoryStore chatMemoryStore;

    @Bean
    StreamingChatLanguageModel model() {
        return OpenAiStreamingChatModel.builder()
                .baseUrl(llmProperties.getBaseUrl())
                .apiKey(llmProperties.getApiKey())
                .modelName(llmProperties.getModelName())
                .temperature(llmProperties.getTemperature())
                .topP(llmProperties.getTopP())
                .maxTokens(llmProperties.getMaxTokens())
                .build();
    }

    @Bean
    ChatModelListener chatModelListener() {
        return new ChatbotChatModelListener();
    }

    @Bean
    @Scope(SCOPE_PROTOTYPE)
    ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> MessageWindowChatMemory.builder()
        .id(memoryId)
        .maxMessages(10)
        .chatMemoryStore(chatMemoryStore)
        .build();
    }

    @Bean
    @Scope(SCOPE_PROTOTYPE)
    StreamingAssistant assistant() {
        return AiServices.builder(StreamingAssistant.class)
                .streamingChatLanguageModel(model())
                .chatMemoryProvider(chatMemoryProvider())
                .build();
    }
}
