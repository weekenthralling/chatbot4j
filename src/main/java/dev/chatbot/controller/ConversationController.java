package dev.chatbot.controller;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import dev.chatbot.domain.ChatHistory;
import dev.chatbot.domain.Conversation;
import dev.chatbot.dto.ChatMessage;
import dev.chatbot.dto.ConversationCreate;
import dev.chatbot.dto.ConversationUpdate;
import dev.chatbot.repository.ChatHistoryRepository;
import dev.chatbot.service.ConversationService;
import dev.chatbot.vo.Chat;
import dev.chatbot.vo.PageBean;

import static dev.langchain4j.data.message.ChatMessageDeserializer.messagesFromJson;

/**
 * ConversationController is a REST controller that handles requests related to
 * conversations.
 * It provides endpoints for creating, updating, deleting, and retrieving
 * conversations.
 *
 * @author zhoumo
 */
@RestController
@RequestMapping("/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversation", description = "Conversation API")
public class ConversationController {

    private final ConversationService conversationService;
    private final ChatHistoryRepository chatHistoryRepository;

    /**
     * This method is used to create a new conversation.
     *
     * @param conversationCreate ConversationDTO
     * @return ResponseEntity<Void>
     */
    @PostMapping("")
    @Operation(summary = "Create a new conversation", description = "Create a new conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "201", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Chat> createConversation(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @Validated @RequestBody ConversationCreate conversationCreate) {
        Conversation conversation = Conversation.builder()
                .title(conversationCreate.getTitle())
                .owner(owner)
                .build();
        conversationService.saveConversation(conversation);
        Chat chat = Chat.builder()
                .id(conversation.getId().toString())
                .title(conversation.getTitle())
                .owner(conversation.getOwner())
                .updatedAt(conversation.getUpdatedAt())
                .build();

        return new ResponseEntity<>(chat, HttpStatus.CREATED);
    }

    @GetMapping("")
    @Operation(summary = "List conversations", description = "List conversations")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<PageBean<Chat>> listConnections(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Conversation> listed = conversationService.listConversationsByOwner(owner, page, size);
        if (listed.getContent().isEmpty()) {
            new ResponseEntity<>(PageBean.emptyPage(page, size), HttpStatus.OK);
        }
        long total = listed.getTotalElements();
        List<Chat> chats = listed.getContent().stream()
                .map(conversation -> Chat.builder()
                        .id(conversation.getId().toString())
                        .title(conversation.getTitle())
                        .updatedAt(conversation.getUpdatedAt())
                        .owner(conversation.getOwner())
                        .pinned(conversation.getPinned())
                        .build())
                .toList();

        PageBean<Chat> result = PageBean.of(page, size, total, chats);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PutMapping("/{convId}")
    @Operation(summary = "Update a conversation", description = "Update a conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "403", description = "Forbidden"),
                @ApiResponse(responseCode = "404", description = "Conversation not found"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Void> updateConversation(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @PathVariable String convId,
            @Validated @RequestBody ConversationUpdate conversationUpdate) {
        UUID conversationId = UUID.fromString(convId);
        Conversation conversation = conversationService.getConversation(conversationId);
        if (!conversation.getOwner().equals(owner)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        conversation.setTitle(conversationUpdate.getTitle());
        if (conversationUpdate.isPinned()) {
            conversation.setPinned(true);
        }
        conversationService.saveConversation(conversation);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{convId}")
    @Operation(summary = "Get a conversation", description = "Get a conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "403", description = "Forbidden"),
                @ApiResponse(responseCode = "404", description = "Conversation not found"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Chat> getConversation(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner, @PathVariable String convId) {
        UUID conversationId = UUID.fromString(convId);
        Conversation conversation = conversationService.getConversation(conversationId);
        if (!conversation.getOwner().equals(owner)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        // Retrieve chat histories for the conversation and convert them to messages
        List<ChatMessage> messages = List.of();
        ChatHistory history = chatHistoryRepository.findById(conversationId).orElse(null);
        if (Objects.nonNull(history)) {
            messages = messagesFromJson(history.getMessage()).stream()
                    .map(ChatMessage::fromLC)
                    .filter(Objects::nonNull)
                    .filter(message -> Objects.nonNull(message.getContent()))
                    // TODO: chatbot only stream "human" and "ai" message now, so we just show these two types
                    // here. In the future, we may need to show other types of messages.
                    .filter(message -> Arrays.asList("human", "ai").contains(message.getType()))
                    .toList();
        }
        Chat chat = Chat.builder()
                .id(conversation.getId().toString())
                .title(conversation.getTitle())
                .updatedAt(conversation.getUpdatedAt())
                .owner(conversation.getOwner())
                .messages(messages)
                .build();
        return new ResponseEntity<>(chat, HttpStatus.OK);
    }

    @DeleteMapping("/{convId}")
    @Operation(summary = "Delete a conversation", description = "Delete a conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "403", description = "Forbidden"),
                @ApiResponse(responseCode = "404", description = "Conversation not found"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Void> deleteConversation(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner, @PathVariable String convId) {
        UUID conversationId = UUID.fromString(convId);
        Conversation chat = conversationService.getConversation(conversationId);
        if (!chat.getOwner().equals(owner)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        conversationService.deleteConversation(conversationId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
