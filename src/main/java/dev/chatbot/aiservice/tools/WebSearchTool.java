package dev.chatbot.aiservice.tools;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.web.search.WebSearchEngine;
import dev.langchain4j.web.search.WebSearchOrganicResult;
import dev.langchain4j.web.search.WebSearchRequest;
import dev.langchain4j.web.search.WebSearchResults;
import io.micrometer.observation.annotation.Observed;
import lombok.AllArgsConstructor;
import org.apache.logging.log4j.util.Strings;

import java.util.List;

/**
 *  <br>
 *
 * @author af su
 * @version v1.0
 */
@AllArgsConstructor
public class WebSearchTool {

    public static final String ANSWER = "Tavily Search API";
    private WebSearchEngine searchEngine;

    @Tool("Useful for when you need to search the Internet.")
    @Observed
    public String search(
            @P("Query to search for. Use the same language as the user's question.") String q,
            @P("Number of results to return. Default is 5.") int n) {

        WebSearchRequest searchRequest =
                WebSearchRequest.builder().searchTerms(q).maxResults(n).build();
        WebSearchResults results = searchEngine.search(searchRequest);
        if (results.results().isEmpty()) {
            return "No results found.";
        }
        if (results.results().get(0).title().equals(ANSWER)) {
            return results.results().get(0).snippet();
        }
        List<String> result =
                results.results().stream().map(WebSearchOrganicResult::snippet).toList();

        return "The following content was found:\n " + Strings.join(result, '\n');
    }

    // I'm not sure if this is helpful.
    public String search(String q) {
        return search(q, 5);
    }
}
