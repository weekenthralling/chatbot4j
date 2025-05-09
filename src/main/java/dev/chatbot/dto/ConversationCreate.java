package dev.chatbot.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO for creating a conversation
 * 
 * @author zhoumo
 */
@Getter
@Setter
public class ConversationCreate {

    /**
     * The title of the conversation
     */
    @NotEmpty(message = "Title cannot be empty")
    @Size(min = 4, max = 50, message = "title must be between 4 and 50 characters")
    private String title;

    /**
     * Enables or disables the rag feature for the conversation
     */
    private boolean ragEnabled;
}
