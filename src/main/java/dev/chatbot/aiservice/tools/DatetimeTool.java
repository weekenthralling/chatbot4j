package dev.chatbot.aiservice.tools;

import java.time.LocalDateTime;

import dev.langchain4j.agent.tool.Tool;
import io.micrometer.observation.annotation.Observed;

/**
 * <br>
 *
 * @author af su
 * @version v1.0
 */
public class DatetimeTool {

    /**
     * This tool is available to {@link dev.chatbot.aiservice.StreamingAssistant}
     */
    @Tool("Get the current date.")
    @Observed
    public String currentTime() {
        return LocalDateTime.now().toString();
    }
}
