package dev.chatbot.aiservice;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;

import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.chat.StreamingChatModel;
import dev.langchain4j.model.chat.listener.ChatModelListener;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.web.search.WebSearchEngine;
import dev.langchain4j.web.search.tavily.TavilyWebSearchEngine;
import lombok.RequiredArgsConstructor;

import dev.chatbot.aiservice.properties.LLMProperties;
import dev.chatbot.aiservice.properties.TavilyProperties;
import dev.chatbot.aiservice.tools.DatetimeTool;
import dev.chatbot.aiservice.tools.WeatherTool;
import dev.chatbot.aiservice.tools.WebSearchTool;

import static org.springframework.beans.factory.config.ConfigurableBeanFactory.SCOPE_PROTOTYPE;

@Configuration
@RequiredArgsConstructor
public class AssistantConfiguration {

    // private final EmbedProperties embedProperties;
    private final LLMProperties llmProperties;
    private final TavilyProperties tavilyProperties;
    private final PersistentChatMemoryStore chatMemoryStore;
    private final List<ChatModelListener> listeners;
    // private final RedisProperties redisProperties;

    @Bean
    WebSearchEngine webSearchEngine() {
        TavilyWebSearchEngine.TavilyWebSearchEngineBuilder builder = TavilyWebSearchEngine.builder()
                .baseUrl(tavilyProperties.getBaseUrl())
                .apiKey(tavilyProperties.getApiKey())
                .searchDepth(tavilyProperties.getSearchDepth())
                .includeDomains(tavilyProperties.getIncludeDomains())
                .excludeDomains(tavilyProperties.getExcludeDomains())
                .includeAnswer(tavilyProperties.getIncludeAnswer())
                .includeRawContent(tavilyProperties.getIncludeRawContent())
                .timeout(tavilyProperties.getTimeout());
        return builder.build();
    }

    // @Bean
    // EmbeddingModel embeddingModel() {
    //     return HuggingfaceEmbeddingModel.builder()
    //             .baseUrl(embedProperties.getBaseUrl())
    //             .normalize(true)
    //             .truncate(false)
    //             .maxRetries(3)
    //             .maxSegmentsPerBatch(32)
    //             .logRequests(false)
    //             .logResponses(false)
    //             .build();
    // }

    // @Bean
    // RedisEmbeddingStore redisEmbeddingStore() {
    //     return RedisEmbeddingStore.builder()
    //             .host(redisProperties.getHost())
    //             .port(redisProperties.getPort())
    //             .password(redisProperties.getPassword())
    //             .prefix("chatbot4j:embedding:job:")
    //             .metadataKeys(List.of("Company", "Description", "Location", "URL"))
    //             .dimension(1024)
    //             .build();
    // }

    @Bean
    StreamingChatModel model() {
        return OpenAiStreamingChatModel.builder()
                .baseUrl(llmProperties.getBaseUrl())
                .apiKey(llmProperties.getApiKey())
                .modelName(llmProperties.getModelName())
                .temperature(llmProperties.getTemperature())
                .topP(llmProperties.getTopP())
                .maxTokens(llmProperties.getMaxTokens())
                .returnThinking(true)
                .listeners(listeners)
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
    public List<Object> toolkit(WebSearchEngine webSearchEngine) {
        return List.of(
                new WeatherTool(),
                new DatetimeTool(),
                // new JobSearchTool(embeddingModel, embeddingStore),
                new WebSearchTool(webSearchEngine));
    }

    @Bean
    @Scope(SCOPE_PROTOTYPE)
    StreamingAssistant assistant(
            StreamingChatModel model, ChatMemoryProvider chatMemoryProvider, List<Object> toolkit) {
        return AiServices.builder(StreamingAssistant.class)
                .streamingChatModel(model)
                .tools(toolkit)
                .chatMemoryProvider(chatMemoryProvider)
                .build();
    }
}
