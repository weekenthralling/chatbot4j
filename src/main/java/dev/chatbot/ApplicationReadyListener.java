package dev.chatbot;

import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import dev.langchain4j.community.store.embedding.redis.RedisEmbeddingStore;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import dev.chatbot.properties.DatasetsProperties;
import dev.chatbot.utils.CSV;

/**
 * This class listens for the application ready event and initializes the vector
 * store. It uses the
 * RedisEmbeddingStore to store and retrieve embeddings.
 *
 * @author zhoumo
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationReadyListener {

    private final DatasetsProperties datasetsProperties;
    private final EmbeddingModel embeddingModel;
    private final RedisEmbeddingStore redisEmbeddingStore;

    @EventListener(ApplicationReadyEvent.class)
    public void initVectorStore(ApplicationReadyEvent event) {

        if (datasetsProperties.getSyncPolicy() == DatasetsProperties.SyncPolicy.NEVER) {
            log.warn("Sync policy is never, skipping vector store initialization.");
            return;
        }
        // Initialize the vector store here
        try {
            // Load the vector store from a file or database
            List<TextSegment> documents = CSV.read(datasetsProperties.getBaseDir()).stream()
                    .map(row -> {
                        String text = row.get("Description");
                        Metadata metadata = new Metadata(row);

                        return new TextSegment(text, metadata);
                    })
                    .toList();
            Response<List<Embedding>> embeddings = embeddingModel.embedAll(documents);
            redisEmbeddingStore.addAll(embeddings.content(), documents);
        } catch (Exception e) {
            log.error("Failed to load datasets: {}", e.getMessage());
            return;
        }
        log.info("Vector store initialized successfully.");
    }
}
