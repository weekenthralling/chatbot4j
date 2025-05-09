package dev.chatbot.exception;

/**
 * BusinessException
 * This class is used to handle the exception when the business logic is wrong.
 * 
 * @author zhoumo
 */
public class BusinessException extends RuntimeException {

    /**
     * BusinessException
     * This method is used to handle the exception when the business logic is wrong.
     * 
     * @param message the message
     */
    public BusinessException(String message) {
        super(message);
    }
}
