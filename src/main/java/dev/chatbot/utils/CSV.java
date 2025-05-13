package dev.chatbot.utils;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;

/**
 * Utility class for reading CSV files.
 * This class provides methods to read CSV files from a specified directory and
 * convert them into a list of maps.
 * Each map represents a row in the CSV file, with the column headers as keys.
 * The values in the map correspond to the data in the respective columns of the
 * CSV file.
 *
 * @author zhoumo
 */
public class CSV {
    private CSV() {
        // Private constructor to prevent instantiation
    }

    /**
     * Reads CSV files from the specified directory and returns a list of maps
     * representing the rows.
     *
     * @param path The path to the directory containing CSV files.
     * @return A list of maps, where each map represents a row in the CSV file with
     *         column headers as keys.
     * @throws IOException  If an I/O error occurs while reading the files.
     * @throws CsvException If a CSV parsing error occurs.
     */
    public static List<Map<String, String>> read(String path) throws IOException, CsvException {
        List<Map<String, String>> result = new ArrayList<>();
        File folder = new File(path);
        // Check if the path is a valid directory
        if (!folder.exists() || !folder.isDirectory()) {
            throw new IllegalArgumentException("Invalid datasetsBase path: " + path);
        }
        // List all CSV files in the directory
        File[] files = folder.listFiles((dir, name) -> name.endsWith(".csv"));
        if (files == null) {
            return result;
        }
        // Iterate through each CSV file and read its content
        for (File file : files) {
            try (CSVReader csvReader = new CSVReaderBuilder(new FileReader(file)).build()) {
                String[] headers = csvReader.readNext(); // Read the first row as headers
                if (headers == null) {
                    continue; // Skip empty files
                }
                // Read the remaining rows and map them to the headers
                String[] row;
                while ((row = csvReader.readNext()) != null) {
                    Map<String, String> rowMap = new HashMap<>();
                    for (int i = 0; i < headers.length; i++) {
                        rowMap.put(headers[i], i < row.length ? row[i] : "");
                    }
                    result.add(rowMap);
                }
            }
        }
        return result;
    }
}
