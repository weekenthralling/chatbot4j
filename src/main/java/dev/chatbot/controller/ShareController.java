package dev.chatbot.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import dev.chatbot.domain.Share;
import dev.chatbot.dto.ConversationShare;
import dev.chatbot.service.ShareService;

/**
 * ShareController is a REST controller that handles requests related to
 * sharing conversations.
 * It provides endpoints for sharing, unsharing, and retrieving shared
 * conversations.
 *
 * @author zhoumo
 */
@RestController
@RequestMapping("/share")
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
    public void shareConversation(@RequestBody ConversationShare share) {
        shareService.saveShare(share);
    }

    @DeleteMapping("/{shareId}")
    @Operation(summary = "Unshare a conversation", description = "Unshare a conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public void deleteShare(@PathVariable String shareId) {
        UUID share = UUID.fromString(shareId);
        shareService.deleteShare(share);
    }

    @GetMapping("/{shareId}")
    @Operation(summary = "Get a shared conversation", description = "Get a shared conversation")
    @ApiResponses(
            value = {
                @ApiResponse(responseCode = "200", description = "Successful"),
                @ApiResponse(responseCode = "400", description = "Bad request"),
                @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public Share getShare(@PathVariable String shareId) {
        UUID share = UUID.fromString(shareId);
        return shareService.getShare(share);
    }
}
