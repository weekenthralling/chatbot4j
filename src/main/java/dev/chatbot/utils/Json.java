package dev.chatbot.utils;

import java.text.SimpleDateFormat;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import dev.chatbot.exception.BusinessException;

/**
 * Json
 * This class is used to convert java objects to json and vice versa.
 *
 * @author zhoumo
 */
public class Json {

    private Json() {
        // Prevent instantiation
    }

    private static final ObjectMapper mapper = new ObjectMapper();
    private static final String DATE_TIME_FORMATTER = "yyyy-MM-dd HH:mm:ss";

    /*
     * Initialize configuration
     */
    static {
        // All fields of the object are listed in
        mapper.setSerializationInclusion(JsonInclude.Include.ALWAYS);
        // Cancel the default conversion timestamps form
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        // Ignore the error of empty bean to json
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        // All date formats are uniformly in the following style, i.e. yyyy-MM-dd
        // HH:mm:ss
        mapper.setDateFormat(new SimpleDateFormat(DATE_TIME_FORMATTER));
        // Ignore the case where there is a json string, but no corresponding attribute
        // exists in the java object. Prevent errors
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /**
     * Function description: Convert java objects into JSON data
     *
     * @param object java object
     * @return JSON data
     */
    public static String toJson(Object object) {
        try {
            return mapper.writeValueAsString(object);
        } catch (Exception e) {
            throw new BusinessException("read from json failed");
        }
    }

    /**
     * Function description: Convert JSON data into java objects
     *
     * @param json  JSON data
     * @param clazz java object class
     * @return java object
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        try {
            return mapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new BusinessException("read from json failed");
        }
    }

    /**
     * Data conversion
     *
     * @param json          JSON data
     * @param typeReference Corresponding type
     * @param <T>           <T>
     * @return <T>
     */
    public static <T> T fromJson(String json, TypeReference<T> typeReference) {
        try {
            return mapper.readValue(json, typeReference);
        } catch (Exception e) {
            throw new BusinessException("read from json with TypeReference failed");
        }
    }
}
