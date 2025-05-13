package dev.chatbot.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

/**
 * DatasetsProperties is a configuration class that holds properties related to the
 * datasets.
 * It is currently empty and can be populated with relevant properties in the future.
 * <p>
 * This class can be used to manage dataset-related configurations in a centralized manner.
 * <p>
 * @author zhoumo
 */
@Configuration
@ConfigurationProperties(prefix = "chatbot.datasets")
@Data
public class DatasetsProperties {
    /**
     * The base directory where datasets are stored.
     */
    private String baseDir;

    /**
     * The policy to use for synchronizing datasets.
     */
    private SyncPolicy syncPolicy;

    public enum SyncPolicy {
        ALWAYS,
        NEVER,
    }
}
