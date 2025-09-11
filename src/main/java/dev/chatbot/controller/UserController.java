package dev.chatbot.controller;

import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.chatbot.dto.UserInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/users")
@Tag(name = "User", description = "User API")
public class UserController {
    
    @GetMapping("/current")
    @Operation(summary = "Get current user info", description = "Retrieve information about the currently authenticated user")
    @ApiResponses(
        value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved user info"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
        }
    )
    public UserInfo getCurrentUserInfo(
        @RequestHeader(name = "X-Forwarded-User", defaultValue = "dev") String userid,
        @RequestHeader(name = "X-Forwarded-Email", defaultValue = "dev@zjuici.com") String email,
        @RequestHeader(name = "X-Forwarded-Preferred-Username", defaultValue = "dev") String username
    ) {
        // Implementation to retrieve current user information
        UserInfo userInfo = new UserInfo();
        userInfo.setUserid(userid);
        userInfo.setEmail(email);
        userInfo.setUsername(username);
        return userInfo;
    }
}
