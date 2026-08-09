package com.ibs.airbook.integration.opensky;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * OpenSky Network — free ADS-B live traffic API (no key required for limited use).
 * Public API: https://opensky-network.org/api/states/all
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenSkyClient {

    public static final String PUBLIC_API = "https://opensky-network.org/api/states/all";

    private final RestTemplate restTemplate;

    public record LiveFlight(
            String icao24,
            String callsign,
            String originCountry,
            Double longitude,
            Double latitude,
            Double altitude,
            Double velocity,
            Double heading,
            Boolean onGround,
            Long lastContact
    ) {}

    @Cacheable(value = "opensky", key = "#lamin + ':' + #lomin + ':' + #lamax + ':' + #lomax")
    @SuppressWarnings("unchecked")
    public List<LiveFlight> fetchLiveTraffic(double lamin, double lomin, double lamax, double lomax) {
        try {
            String url = String.format(Locale.US,
                    PUBLIC_API + "?lamin=%.2f&lomin=%.2f&lamax=%.2f&lomax=%.2f",
                    lamin, lomin, lamax, lomax);
            Map<String, Object> body = restTemplate.getForObject(url, Map.class);
            if (body == null || !(body.get("states") instanceof List<?> states)) {
                return List.of();
            }
            List<LiveFlight> flights = new ArrayList<>();
            for (Object row : states) {
                if (!(row instanceof List<?> cols) || cols.size() < 9) continue;
                String callsign = cols.get(1) != null ? cols.get(1).toString().trim() : "";
                if (callsign.isBlank()) continue;
                flights.add(new LiveFlight(
                        cols.get(0) != null ? cols.get(0).toString() : "",
                        callsign,
                        cols.get(2) != null ? cols.get(2).toString() : "UNK",
                        toDouble(cols.get(5)),
                        toDouble(cols.get(6)),
                        toDouble(cols.get(7)),
                        cols.size() > 9 ? toDouble(cols.get(9)) : null,
                        cols.size() > 10 ? toDouble(cols.get(10)) : null,
                        cols.get(8) instanceof Boolean b && b,
                        cols.size() > 4 && cols.get(4) instanceof Number n ? n.longValue() : null
                ));
                if (flights.size() >= 80) break;
            }
            return flights;
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("429") || msg.toLowerCase().contains("too many")) {
                log.warn("OpenSky rate-limited (free tier). Showing empty set until cooldown.");
            } else {
                log.warn("OpenSky unavailable: {}", msg);
            }
            return List.of();
        }
    }

    public int estimateCorridorDemand(String origin, String destination) {
        double[] box = corridorBox(origin, destination);
        List<LiveFlight> live = fetchLiveTraffic(box[0], box[1], box[2], box[3]);
        if (live.isEmpty()) {
            // Fast heuristic when OpenSky is slow/rate-limited — keep search responsive
            int h = Math.abs((origin + "-" + destination).hashCode());
            return 45 + (h % 40);
        }
        int airborne = (int) live.stream().filter(f -> !Boolean.TRUE.equals(f.onGround())).count();
        return Math.min(100, 35 + airborne * 2);
    }

    public double[] corridorBox(String origin, String destination) {
        Set<String> india = Set.of("COK", "BLR", "BOM", "DEL", "MAA", "HYD", "CCU", "GOI", "AMD", "PNQ");
        Set<String> gulf = Set.of("DXB", "AUH", "DOH", "BAH", "RUH", "JED", "MCT");
        Set<String> europe = Set.of("LHR", "CDG", "FRA", "AMS", "MAD", "FCO", "ZRH", "MUC");
        Set<String> usa = Set.of("JFK", "EWR", "ORD", "LAX", "SFO", "IAD");
        Set<String> sea = Set.of("SIN", "KUL", "BKK", "CGK", "HKG", "NRT");

        if (india.contains(origin) && gulf.contains(destination) || gulf.contains(origin) && india.contains(destination)) {
            return new double[]{8.0, 50.0, 30.0, 80.0};
        }
        if (india.contains(origin) && europe.contains(destination) || europe.contains(origin) && india.contains(destination)) {
            return new double[]{8.0, -10.0, 55.0, 80.0};
        }
        if (india.contains(origin) && usa.contains(destination) || usa.contains(origin) && india.contains(destination)) {
            return new double[]{8.0, -80.0, 55.0, 80.0};
        }
        if (india.contains(origin) && sea.contains(destination) || sea.contains(origin) && india.contains(destination)) {
            return new double[]{-10.0, 70.0, 35.0, 140.0};
        }
        return new double[]{0.0, -20.0, 60.0, 100.0};
    }

    private Double toDouble(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        return null;
    }
}
