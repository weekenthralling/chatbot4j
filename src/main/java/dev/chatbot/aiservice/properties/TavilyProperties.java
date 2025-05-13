package dev.chatbot.aiservice.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

/**
 *  <br>
 *
 * @author af su
 * @version v1.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "tavily")
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
