package dev.chatbot.controller;

import dev.chatbot.aiservice.StreamingAssistant;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name="Assistant", description = "Assistant API")
public class AssistantController {

    private final StreamingAssistant assistant;

    @GetMapping("/assistant")
    @Operation(summary = "Assistant API", description = "Get assistant response")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful response"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Flux<String> assistant(@RequestParam(value = "message", defaultValue = "What is the answer of 2^10?") String message) {
        return assistant.chat(UUID.randomUUID(), message);
    }
}
