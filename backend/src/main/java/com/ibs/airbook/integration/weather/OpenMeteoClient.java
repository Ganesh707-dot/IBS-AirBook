package com.ibs.airbook.integration.weather;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Locale;
import java.util.Map;

/**
 * Open-Meteo — free weather API, no key required.
 * https://open-meteo.com/en/docs
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenMeteoClient {

    public static final String API = "https://api.open-meteo.com/v1/forecast";

    private final RestTemplate restTemplate;

    public record WeatherSnapshot(double temperatureC, int weatherCode, double windKmh, String source) {}

    @Cacheable(value = "weather", key = "#lat + ':' + #lon")
    @SuppressWarnings("unchecked")
    public WeatherSnapshot current(double lat, double lon) {
        try {
            String url = String.format(Locale.US,
                    "%s?latitude=%.4f&longitude=%.4f&current=temperature_2m,weather_code,wind_speed_10m",
                    API, lat, lon);
            Map<String, Object> body = restTemplate.getForObject(url, Map.class);
            if (body == null || !(body.get("current") instanceof Map<?, ?> current)) {
                return fallback();
            }
            double temp = current.get("temperature_2m") instanceof Number n ? n.doubleValue() : 28.0;
            int code = current.get("weather_code") instanceof Number n ? n.intValue() : 0;
            double wind = current.get("wind_speed_10m") instanceof Number n ? n.doubleValue() : 0;
            return new WeatherSnapshot(temp, code, wind, API);
        } catch (Exception e) {
            log.warn("Open-Meteo unavailable: {}", e.getMessage());
            return fallback();
        }
    }

    public String describeCode(int code) {
        if (code == 0) return "Clear";
        if (code <= 3) return "Partly cloudy";
        if (code <= 48) return "Fog";
        if (code <= 67) return "Rain";
        if (code <= 77) return "Snow";
        if (code <= 82) return "Showers";
        if (code <= 99) return "Thunderstorm";
        return "Variable";
    }

    private WeatherSnapshot fallback() {
        return new WeatherSnapshot(28.0, 1, 12.0, "fallback");
    }
}
