package dev.chatbot.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

import dev.chatbot.aiservice.StreamingAssistant;
import dev.chatbot.dto.ChatMessage;

import static org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE;

/**
 * AssistantController is a REST controller that handles requests related to the
 * assistant.
 * It provides an endpoint for sending messages to the assistant and receiving
 * responses.
 *
 * @author zhoumo
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Assistant", description = "Assistant API")
public class AssistantController {

    private final StreamingAssistant assistant;

    @PostMapping(value = "/{conversationId}/assistant", produces = TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Assistant API", description = "Get assistant response")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful response"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public Flux<String> assistant(@PathVariable String conversationId, @RequestBody ChatMessage message) {
        // Use conversation id as the session id for the conversation
        UUID sessionId = UUID.fromString(conversationId);
        return this.assistant.chat(sessionId, message.getContent());
    }
}
