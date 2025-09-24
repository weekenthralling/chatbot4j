package dev.chatbot.utils;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JsonTest {
    @Test
    public void testToJson() {
        Map<String, Object> map = new HashMap<>();
        map.put("name", "Copilot");
        map.put("age", 1);
        String json = Json.toJson(map);
        assertTrue(json.contains("name"));
        assertTrue(json.contains("Copilot"));
        assertTrue(json.contains("age"));
    }

    @Test
    public void testFromJson() {
        String json = "{\"name\":\"Copilot\",\"age\":1}";
        Map<?, ?> map = Json.fromJson(json, Map.class);
        assertEquals("Copilot", map.get("name"));
        assertEquals(1, map.get("age"));
    }

    @Test
    public void testFromJsonInvalid() {
        String invalidJson = "{name:Copilot,age:1}";
        assertThrows(Exception.class, () -> Json.fromJson(invalidJson, Map.class));
    }
}
