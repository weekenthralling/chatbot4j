package dev.chatbot.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for updating a conversation
 * 
 * @author zhoumo
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationUpdate extends ConversationCreate {

    /**
     * pinned conversion or not
     */
    private boolean pinned;

}
