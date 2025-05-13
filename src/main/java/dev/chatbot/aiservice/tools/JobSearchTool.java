package dev.chatbot.aiservice.tools;

import java.util.List;
import java.util.Map;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.community.store.embedding.redis.RedisEmbeddingStore;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;

import dev.chatbot.utils.Json;

/**
 * JobSearchTool is a class that provides functionality for job searching.
 * It allows users to search for jobs based on various criteria such as job
 * title, location, and company.
 *
 * @author zhoumo
 */
public class JobSearchTool {

    private final EmbeddingModel embeddingModel;
    private final RedisEmbeddingStore redisEmbeddingStore;

    public JobSearchTool(EmbeddingModel embeddingModel, RedisEmbeddingStore redisEmbeddingStore) {
        this.embeddingModel = embeddingModel;
        this.redisEmbeddingStore = redisEmbeddingStore;
    }

    @Tool(name = "JobSearchTool", value = "A tool to search for jobs. Search for jobs according to your requirements")
    public String execSearch(
            @P("Related descriptions of jobs, such as job positions, years of work, etc.") String describe) {
        // Embed the input text
        Response<Embedding> embed = embeddingModel.embed(describe);
        // Build the embedding search request
        EmbeddingSearchRequest request = EmbeddingSearchRequest.builder()
                .queryEmbedding(embed.content())
                .maxResults(5)
                .build();
        // Search for similar jobs in the Redis embedding store
        EmbeddingSearchResult<TextSegment> searched = redisEmbeddingStore.search(request);
        List<Map<String, Object>> texts = searched.matches().stream()
                .map(match -> match.embedded().metadata())
                .map(Metadata::toMap)
                .toList();
        // Convert the result to JSON
        return Json.toJson(texts);
    }
}
