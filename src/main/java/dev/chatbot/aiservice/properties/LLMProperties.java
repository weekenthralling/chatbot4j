package dev.chatbot.aiservice.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

/**
 * LLMProperties is a configuration class that holds properties related to the
 * LLM (Language Model).
 * It is annotated with @ConfigurationProperties to bind properties from the
 * application configuration file.
 * The prefix "llm" indicates that these properties are under the "llm" section
 * in the configuration file.
 *
 * @author zhoumo
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "chatbot.llm")
public class LLMProperties {

    /**
     * The base URL for the LLM API.
     */
    private String baseUrl;

    /**
     * The API key for authentication with the LLM API.
     */
    private String apiKey;

    /**
     * The name of the model to be used.
     */
    private String modelName;

    /**
     * The temperature setting for the model.
     * This controls the randomness of the output.
     * A higher value (e.g., 1.0) makes the output more random,
     */
    private double temperature;

    /**
     * The top-p setting for the model.
     * This controls the diversity of the output.
     * A higher value (e.g., 0.9) means that the model will consider more options.
     */
    private double topP;

    /**
     * The maximum number of tokens to generate in the response.
     * This limits the length of the output.
     * A higher value (e.g., 100) allows for longer responses.
     */
    private int maxTokens;
}
