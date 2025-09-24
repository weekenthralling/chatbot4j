package dev.chatbot.utils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.opencsv.exceptions.CsvException;

import static org.junit.jupiter.api.Assertions.*;

class CSVTest {
    /**
     * Mocks file creation and writing.
     * Tests CSV.read for normal parsing logic.
     */
    /**
     * Mocks a directory and creates a CSV file inside it.
     * Tests CSV.read for normal parsing logic (directory input).
     */
    @Test
    void testReadCsv(@TempDir Path tempDir) throws IOException, CsvException {
        // Mock: create a temporary CSV file in a temp directory
        File csvFile = tempDir.resolve("test.csv").toFile();
        try (FileWriter writer = new FileWriter(csvFile)) {
            writer.write("name,age\nCopilot,1\nAlice,2\n");
        }
        // Test: call CSV.read with directory path and assert results
        List<Map<String, String>> result = CSV.read(tempDir.toString());
        assertEquals(2, result.size()); // Only assert data rows
        assertEquals("Copilot", result.get(0).get("name"));
        assertEquals("1", result.get(0).get("age"));
        assertEquals("Alice", result.get(1).get("name"));
        assertEquals("2", result.get(1).get("age"));
    }

    /**
     * Test: should throw exception when directory does not exist
     */
    @Test
    void testReadCsvDirNotFound() {
        Exception exception = assertThrows(IllegalArgumentException.class, () -> CSV.read("/not/exist/dir"));
        assertTrue(exception.getMessage().contains("Invalid datasetsBase path"));
    }
}
