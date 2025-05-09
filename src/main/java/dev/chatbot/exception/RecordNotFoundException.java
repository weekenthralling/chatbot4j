package dev.chatbot.exception;

/**
 * RecordNotFoundException
 * This class is used to handle the exception when the record is not found.
 * 
 * @author zhoumo
 */
public class RecordNotFoundException extends RuntimeException {
    public RecordNotFoundException(String message) {
        super(message);
    }
}
