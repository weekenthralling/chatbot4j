package dev.chatbot.exception;

/**
 * ForbiddenException
 * This class is used to handle the exception when access is forbidden.
 *
 * @author zhoumo
 */
public class ForbiddenException extends RuntimeException {

    /**
     * ForbiddenException is thrown when a user attempts to access a resource
     * they do not have permission to access.
     * @param message
     */
    public ForbiddenException(String message) {
        super(message);
    }
}
