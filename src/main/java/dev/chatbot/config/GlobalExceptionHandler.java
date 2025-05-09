package dev.chatbot.config;

import dev.chatbot.exception.RecordNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * GlobalExceptionHandler
 * This class is used to handle all the exceptions thrown in the application.
 * 
 * @author zhoumo
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * This method is used to handle the MethodArgumentNotValidException.
     * 
     * @param ex MethodArgumentNotValidException
     * @return ResponseEntity<String>
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
        StringBuilder errorMessage = new StringBuilder("Validation failed: ");
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errorMessage.append(fieldError.getField()).append(": ").append(fieldError.getDefaultMessage()).append("; ");
        }
        return new ResponseEntity<>(errorMessage.toString(), HttpStatus.BAD_REQUEST);
    }

    /**
     * This method is used to handle the RecordNotFoundException.
     * 
     * @param ex RecordNotFoundException
     * @return ResponseEntity<String>
     */
    @ExceptionHandler(RecordNotFoundException.class)
    public ResponseEntity<String> handleRecordNotFoundException(RecordNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    /**
     * This method is used to handle the other Exception.
     * 
     * @param ex Exception
     * @return ResponseEntity<String>
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleServiceException(Exception ex) {
        return new ResponseEntity<>("Service error: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
