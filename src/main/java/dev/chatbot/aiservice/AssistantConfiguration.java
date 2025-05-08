package dev.chatbot.aiservice;

import dev.chatbot.aiservice.embeddings.HuggingfaceEmbeddingModel;
import dev.chatbot.aiservice.properties.EmbedProperties;
import dev.chatbot.aiservice.properties.LLMProperties;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.embedding.EmbeddingModel;
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

    private final EmbedProperties embedProperties;
    private final LLMProperties llmProperties;
    private final PersistentChatMemoryStore chatMemoryStore;

    @Bean
    EmbeddingModel embeddingModel() {
        return HuggingfaceEmbeddingModel.builder()
                .baseUrl(embedProperties.getBaseUrl())
                .normalize(true)
                .truncate(false)
                .maxRetries(3)
                .maxSegmentsPerBatch(32)
                .logRequests(false)
                .logResponses(false)
                .build();
    }

    @Bean
    StreamingChatModel model() {
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
    StreamingAssistant assistant(StreamingChatModel model,
                                 ChatMemoryProvider chatMemoryProvider) {
        return AiServices.builder(StreamingAssistant.class)
                .streamingChatModel(model)
                .chatMemoryProvider(chatMemoryProvider)
                .build();
    }
}
