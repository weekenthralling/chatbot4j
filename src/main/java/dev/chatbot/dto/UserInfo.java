package dev.chatbot.dto;

import lombok.Data;

/**
 * UserInfo is a Data Transfer Object (DTO) that represents user information.
 */
@Data
public class UserInfo {

    /**
     * User ID
     */
    private String userid;

    /**
     * Username
     */
    private String username;

    /**
     * Email address
     */
    private String email;
}
