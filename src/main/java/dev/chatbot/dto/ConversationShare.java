package dev.chatbot.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * @author zhoumo
 */
@Data
public class ConversationShare {

    /**
     * conversaion session id
     */
    @NotEmpty
    private String sessionId;
}
