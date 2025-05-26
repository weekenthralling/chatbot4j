package dev.chatbot.aiservice.properties;

import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

/**
 *  <br>
 *
 * @author af su
 * @version v1.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "chatbot.tavily")
public class TavilyProperties {
    private String baseUrl = "https://api.tavily.com";
    private String apiKey;
    private Duration timeout = Duration.ofSeconds(30);
    private String searchDepth = "basic";
    private Boolean includeAnswer = Boolean.TRUE;
    private Boolean includeRawContent = Boolean.TRUE;
    private Boolean includeImages = Boolean.FALSE;
    private List<String> includeDomains = List.of();
    private List<String> excludeDomains = List.of();
}
