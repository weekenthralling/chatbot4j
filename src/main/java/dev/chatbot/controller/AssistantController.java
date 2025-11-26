package dev.chatbot.controller;

import java.time.Instant;
import java.util.UUID;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.langchain4j.service.TokenStream;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;

import dev.chatbot.aiservice.StreamingAssistant;
import dev.chatbot.domain.Conversation;
import dev.chatbot.dto.ChatMessage;
import dev.chatbot.exception.ForbiddenException;
import dev.chatbot.service.ConversationService;

import static org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE;

import static dev.chatbot.utils.Json.toJson;

/**
 * AssistantController is a REST controller that handles requests related to the
 * assistant.
 * It provides an endpoint for sending messages to the assistant and receiving
 * responses.
 *
 * @author zhoumo
 */
@RequestMapping("/api")
@RestController
@RequiredArgsConstructor
@Tag(name = "Assistant", description = "Assistant API")
public class AssistantController {

    private final StreamingAssistant assistant;

    private final ConversationService conversationService;

    @PostMapping(value = "/{conversationId}/assistant", produces = TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Assistant API", description = "Get assistant response")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful response"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "404", description = "Conversation not found"),
                @ApiResponse(responseCode = "403", description = "Forbidden"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public Flux<String> assistant(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @PathVariable String conversationId,
            @RequestBody ChatMessage message) {
        // Use conversation id as the session id for the conversation
        UUID sessionId = UUID.fromString(conversationId);

        Conversation conversation = this.conversationService.getConversation(sessionId);
        // Additional validation can be added here to check if the owner matches
        // the conversation owner.
        if (!conversation.getOwner().equals(owner)) {
            throw new ForbiddenException("Owner does not match conversation owner");
        }

        String runId = UUID.randomUUID().toString();

        return Flux.create(sink -> {
            TokenStream tokenStream = this.assistant.chat(sessionId, message.getContent());

            tokenStream
                    .onPartialResponse(token -> {
                        ChatMessage partialMessage = ChatMessage.builder()
                                .id(runId)
                                .parentId(message.getId())
                                .type("AIMessageChunk")
                                .from("ai")
                                .sentAt(Instant.now())
                                .content(token)
                                .build();
                        sink.next(toJson(partialMessage));
                    })
                    .onPartialThinking(partialThinking -> {
                        ChatMessage thinkMessage = ChatMessage.builder()
                                .id(runId)
                                .parentId(message.getId())
                                .type("AIMessageChunk")
                                .from("ai")
                                .sentAt(Instant.now())
                                .reasoning(partialThinking.text())
                                .content("") // Empty content when only thinking
                                .build();
                        sink.next(toJson(thinkMessage));
                    })
                    .onCompleteResponse(response -> {
                        sink.next("[DONE]");
                        sink.complete();
                    })
                    .onError(error -> {
                        ChatMessage errorMessage = ChatMessage.builder()
                                .id(runId)
                                .parentId(message.getId())
                                .type("error")
                                .sentAt(Instant.now())
                                .content("An error occurred: " + error.getMessage())
                                .build();
                        sink.next(toJson(errorMessage));
                        sink.complete();
                    })
                    .start();
        });
    }
}
