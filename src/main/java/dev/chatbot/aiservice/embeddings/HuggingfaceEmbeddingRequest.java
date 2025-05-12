package dev.chatbot.aiservice.embeddings;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
public class HuggingfaceEmbeddingRequest {

    @JsonProperty
    private final List<String> inputs;

    @JsonProperty
    private final Boolean normalize;

    @JsonProperty
    private final Boolean truncate;
}
