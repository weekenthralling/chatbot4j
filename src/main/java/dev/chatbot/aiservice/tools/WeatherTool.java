package dev.chatbot.aiservice.tools;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;
import io.micrometer.observation.annotation.Observed;

/**
 * <br>
 *
 * @author af su
 * @version v1.0
 */
public class WeatherTool {

    private final Logger logger = LoggerFactory.getLogger(WeatherTool.class);
    private static final String FORECAST_API_URL =
            "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true";
    private static final String COORDINATES_API_URL =
            "https://geocoding-api.open-meteo.com/v1/search?name=%s&format=json";

    private final RestTemplate restTemplate = new RestTemplate();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Tool("A tool to get the current weather of a given city.")
    @Observed
    public String weatherForecast(
            @P("Location for forecast. Accepts **English** location names or postal codes.") String location) {
        double[] coords = getCoordinates(location);
        if (coords == null) {
            return String.format("Sorry, I couldn't find the location for %s", location);
        }

        String url = String.format(FORECAST_API_URL, coords[0], coords[1]);

        try {
            String jsonResponse = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(jsonResponse);
            JsonNode currentWeather = jsonNode.get("current_weather");

            if (currentWeather != null) {
                double temperature = currentWeather.get("temperature").asDouble();
                double windspeed = currentWeather.get("windspeed").asDouble();
                int weatherCode = currentWeather.get("weathercode").asInt();
                String weatherDesc = getWeatherDescription(weatherCode);

                return String.format(
                        "Current temperature: %.1f°C, Windspeed: %.1f km/h, Condition: %s",
                        temperature, windspeed, weatherDesc);
            }
        } catch (Exception e) {
            logger.warn("Error fetching weather data: {}", e.getMessage());
        }
        return null;
    }

    private double[] getCoordinates(String city) {
        String url = String.format(COORDINATES_API_URL, city);

        try {
            String jsonResponse = restTemplate.getForObject(url, String.class);
            JsonNode jsonNode = objectMapper.readTree(jsonResponse);
            JsonNode resultsArray = jsonNode.get("results");

            if (resultsArray != null && resultsArray.isArray() && !resultsArray.isEmpty()) {
                JsonNode node = resultsArray.get(0);
                return new double[] {
                    node.get("latitude").asDouble(-1.0), node.get("longitude").asDouble(-1.0)
                };
            }
        } catch (Exception e) {
            logger.warn("Error fetching coordinates data: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Currently referencing <a href="https://open-meteo.com/en/docs"> However, depends on the output, might need to
     * reference <a href="https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM">
     * instead.
     *
     * @return desc
     */
    private String getWeatherDescription(int code) {
        return switch (code) {
            case 0 -> "Clear sky";
            case 1 -> "Mainly clear";
            case 2 -> "Partly cloudy";
            case 3 -> "Overcast";
            case 45, 48 -> "Fog";
            case 51, 53, 55 -> "Drizzle";
            case 56, 57 -> "Freezing drizzle";
            case 61, 63, 65 -> "Rain";
            case 66, 67 -> "Freezing rain";
            case 71, 73, 75 -> "Snow fall";
            case 77 -> "Snow grains";
            case 80, 81, 82 -> "Rain showers";
            case 85, 86 -> "Snow showers";
            case 95 -> "Thunderstorm";
            case 96 -> "Thunderstorm with slight hail";
            case 99 -> "Thunderstorm with heavy hail";
            default -> "Unknown conditions";
        };
    }
}
