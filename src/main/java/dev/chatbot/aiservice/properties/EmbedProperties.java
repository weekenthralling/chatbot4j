package dev.chatbot.aiservice.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

/**
 * EmbedProperties is a configuration class that holds properties related to the
 * embedding model.
 * It is annotated with @ConfigurationProperties to bind properties from the
 * application configuration file.
 * The prefix "chatbot.embed" indicates that these properties are under the
 * "chatbot.embed" section in the configuration file.
 *
 * @author zhoumo
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "chatbot.embedding")
public class EmbedProperties {
    private String baseUrl;
}
