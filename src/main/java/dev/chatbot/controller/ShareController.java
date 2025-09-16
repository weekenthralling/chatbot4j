package dev.chatbot.controller;

import java.util.Arrays;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import dev.chatbot.domain.Share;
import dev.chatbot.dto.ChatMessage;
import dev.chatbot.dto.ConversationShare;
import dev.chatbot.service.ShareService;
import dev.chatbot.vo.PageBean;
import dev.chatbot.vo.Shared;

import static dev.langchain4j.data.message.ChatMessageDeserializer.messagesFromJson;

/**
 * ShareController is a REST controller that handles requests related to
 * sharing conversations.
 * It provides endpoints for sharing, unsharing, and retrieving shared
 * conversations.
 *
 * @author zhoumo
 */
@RestController
@RequestMapping("/shares")
@RequiredArgsConstructor
@Tag(name = "Share", description = "Share API")
public class ShareController {

    private final ShareService shareService;

    @PostMapping("")
    @Operation(summary = "Share a conversation", description = "Share a conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "201", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Shared> shareConversation(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @RequestBody ConversationShare share) {
        String baseUrl =
                ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        var createdshare = shareService.saveShare(share, owner, baseUrl);

        var shared = Shared.builder()
                .id(createdshare.getId())
                .title(createdshare.getTitle())
                .owner(createdshare.getOwner())
                .url(createdshare.getUrl())
                .createdAt(createdshare.getCreatedAt())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(shared);
    }

    @DeleteMapping("/{shareId}")
    @Operation(summary = "Unshare a conversation", description = "Unshare a conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "204", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Void> deleteShare(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @PathVariable String shareId) {
        shareService.deleteShare(UUID.fromString(shareId), owner);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{shareId}")
    @Operation(summary = "Get a shared conversation", description = "Get a shared conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<Shared> getShare(@PathVariable String shareId) {
        Share share = shareService.getShare(UUID.fromString(shareId));
        var messages = messagesFromJson(share.getSnapshotRef()).stream()
                .map(ChatMessage::fromLC)
                .filter(Objects::nonNull)
                .filter(message -> Objects.nonNull(message.getContent()))
                .filter(message -> Arrays.asList("human", "ai").contains(message.getType()))
                .toList();

        var shared = Shared.builder()
                .id(share.getId())
                .title(share.getTitle())
                .owner(share.getOwner())
                .url(share.getUrl())
                .messages(messages)
                .createdAt(share.getCreatedAt())
                .build();
        return ResponseEntity.ok(shared);
    }

    @GetMapping("")
    @Operation(summary = "List shared conversations", description = "Get a list of shared conversations")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<PageBean<Shared>> listShares(
            @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String owner,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Share> shares = shareService.listShares(owner, page, size);
        if (shares.getContent().isEmpty()) {
            return ResponseEntity.ok().body(PageBean.emptyPage(page, size));
        }
        var items = shares.getContent().stream()
                .map(share -> Shared.builder()
                        .id(share.getId())
                        .title(share.getTitle())
                        .owner(share.getOwner())
                        .url(share.getUrl())
                        .createdAt(share.getCreatedAt())
                        .build())
                .toList();
        return ResponseEntity.ok().body(PageBean.of(page, size, shares.getTotalElements(), items));
    }
}
