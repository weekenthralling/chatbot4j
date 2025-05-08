package dev.chatbot.aiservice.embeddings;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import com.fasterxml.jackson.core.type.TypeReference;

import dev.chatbot.utils.Json;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.http.client.HttpClient;
import dev.langchain4j.http.client.HttpClientBuilder;
import dev.langchain4j.http.client.HttpClientBuilderLoader;
import dev.langchain4j.http.client.HttpRequest;
import dev.langchain4j.http.client.SuccessfulHttpResponse;
import dev.langchain4j.http.client.log.LoggingHttpClient;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.model.output.TokenUsage;

import static dev.langchain4j.http.client.HttpMethod.POST;
import static dev.langchain4j.internal.Utils.getOrDefault;
import static dev.langchain4j.internal.RetryUtils.withRetryMappingExceptions;
import static java.time.Duration.ofSeconds;

public class HuggingfaceEmbeddingModel implements EmbeddingModel{

    private final HttpClient httpClient;

    private final String baseUrl;
    private final Integer batchSize;
    
    private final Boolean normalize;
    private final Boolean truncate;

    private final Integer maxRetries;
    private final Map<String, String> defaultHeaders;

    public HuggingfaceEmbeddingModel(HuggingfaceEmbeddingModelBuilder builder) {

        HttpClientBuilder httpClientBuilder =
                        getOrDefault(builder.httpClientBuilder, HttpClientBuilderLoader::loadHttpClientBuilder);
        HttpClient httpClient = httpClientBuilder
                    .connectTimeout(getOrDefault(getOrDefault(builder.timeout, httpClientBuilder.connectTimeout()), ofSeconds(15)))
                    .readTimeout(getOrDefault(getOrDefault(builder.timeout, httpClientBuilder.readTimeout()), ofSeconds(60)))
                    .build();
        
        if (builder.logRequests || builder.logResponses) {
            this.httpClient = new LoggingHttpClient(httpClient, builder.logRequests, builder.logResponses);
        } else {
            this.httpClient = httpClient;
        }

        this.baseUrl = builder.baseUrl;
        this.batchSize = getOrDefault(builder.maxSegmentsPerBatch, 32);
        this.normalize = getOrDefault(builder.normalize, true);
        this.truncate = getOrDefault(builder.truncate, false);
        this.maxRetries = getOrDefault(builder.maxRetries, 3);
        
        Map<String, String> defaultHeaders = new HashMap<>();
        if (builder.customHeaders != null) {
            defaultHeaders.putAll(builder.customHeaders);
        }
        this.defaultHeaders = defaultHeaders;
    }


    @Override
    public Response<List<Embedding>> embedAll(List<TextSegment> textSegments) {
        List<String> texts = textSegments.stream().map(TextSegment::text).toList();

        List<List<String>> textBatches = partition(texts, batchSize);

        return embedBatchedTexts(textBatches);
    }

    private List<List<String>> partition(List<String> inputList, int size) {
        List<List<String>> result = new ArrayList<>();
        for (int i = 0; i < inputList.size(); i += size) {
            int fromIndex = i;
            int toIndex = Math.min(i + size, inputList.size());
            result.add(inputList.subList(fromIndex, toIndex));
        }
        return result;
    }

    private Response<List<Embedding>> embedBatchedTexts(List<List<String>> textBatches) {
        List<Response<List<Embedding>>> responses = new ArrayList<>();
        for (List<String> batch : textBatches) {
            Response<List<Embedding>> response = embedTexts(batch);
            responses.add(response);
        }
        return Response.from(
                responses.stream()
                        .flatMap(response -> response.content().stream())
                        .toList(),
                responses.stream()
                        .map(Response::tokenUsage)
                        .filter(Objects::nonNull)
                        .reduce(TokenUsage::add)
                        .orElse(null));
    }

    private Response<List<Embedding>> embedTexts(List<String> input) {
        HuggingfaceEmbeddingRequest request = HuggingfaceEmbeddingRequest.builder()
                .inputs(input)
                .normalize(normalize)
                .truncate(truncate)
                .build();

        HttpRequest httpRequest = HttpRequest.builder()
                .method(POST)
                .url(baseUrl, "embed")
                .addHeader("Content-Type", "application/json")
                .addHeaders(defaultHeaders)
                .body(Json.toJson(request))
                .build();

        SuccessfulHttpResponse successfulHttpResponse = withRetryMappingExceptions(() -> httpClient.execute(httpRequest), maxRetries);
        List<List<Float>> response = Json.fromJson(successfulHttpResponse.body(), new TypeReference<List<List<Float>>>() {});
        List<Embedding> embeddings = response.stream().map(Embedding::from).toList();
        return Response.from(embeddings);
    }

    public static HuggingfaceEmbeddingModelBuilder builder() {
        return new HuggingfaceEmbeddingModelBuilder();
    }

    public static class HuggingfaceEmbeddingModelBuilder {

        private HttpClientBuilder httpClientBuilder;
        private String baseUrl;
        private Boolean normalize;
        private Boolean truncate;

        private Duration timeout;
        private Integer maxRetries;
        private Integer maxSegmentsPerBatch;
        private Boolean logRequests;
        private Boolean logResponses;
        private Map<String, String> customHeaders;
        
        public HuggingfaceEmbeddingModelBuilder() {
            // This is public so it can be extended
        }

        public HuggingfaceEmbeddingModelBuilder httpClientBuilder(HttpClientBuilder httpClientBuilder) {
            this.httpClientBuilder = httpClientBuilder;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder baseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder timeout(Duration timeout) {
            this.timeout = timeout;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder maxRetries(Integer maxRetries) {
            this.maxRetries = maxRetries;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder logRequests(Boolean logRequests) {
            this.logRequests = logRequests;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder logResponses(Boolean logResponses) {
            this.logResponses = logResponses;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder customHeaders(Map<String, String> customHeaders) {
            this.customHeaders = customHeaders;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder maxSegmentsPerBatch(Integer maxSegmentsPerBatch) {
            this.maxSegmentsPerBatch = maxSegmentsPerBatch;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder normalize(boolean normalize) {
            this.normalize = normalize;
            return this;
        }

        public HuggingfaceEmbeddingModelBuilder truncate(boolean truncate) {
            this.truncate = truncate;
            return this;
        }

        public HuggingfaceEmbeddingModel build() {
            return new HuggingfaceEmbeddingModel(this);
        }
    }
}
