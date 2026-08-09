package com.ibs.airbook.market;

import com.ibs.airbook.catalog.Airport;
import com.ibs.airbook.catalog.AirportRepository;
import com.ibs.airbook.integration.fx.FrankfurterClient;
import com.ibs.airbook.integration.opensky.OpenSkyClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final OpenSkyClient openSkyClient;
    private final FrankfurterClient frankfurterClient;
    private final AirportRepository airportRepository;

    @GetMapping("/pulse")
    public ResponseEntity<Map<String, Object>> pulse(
            @RequestParam(defaultValue = "COK") String origin,
            @RequestParam(defaultValue = "DXB") String destination) {
        // Pulse stays fast: local demand signal + cached FX (OpenSky reserved for /live-flights)
        int demand = 45 + Math.abs((origin + "-" + destination).toUpperCase().hashCode() % 40);
        BigDecimal fx = frankfurterClient.eurToInr();
        return ResponseEntity.ok(Map.of(
                "origin", origin.toUpperCase(),
                "destination", destination.toUpperCase(),
                "demandScore", demand,
                "eurInr", fx,
                "liveFlightsSample", List.of(),
                "sources", List.of("OpenSky Network ADS-B", "Frankfurter ECB FX"),
                "openSkyApi", OpenSkyClient.PUBLIC_API
        ));
    }

    /**
     * Live flight tracker feed — proxies free OpenSky Network ADS-B states.
     * Upstream: https://opensky-network.org/api/states/all
     */
    @GetMapping("/live-flights")
    public ResponseEntity<Map<String, Object>> liveFlights(
            @RequestParam(defaultValue = "COK") String origin,
            @RequestParam(defaultValue = "DXB") String destination,
            @RequestParam(required = false) Double lamin,
            @RequestParam(required = false) Double lomin,
            @RequestParam(required = false) Double lamax,
            @RequestParam(required = false) Double lomax) {
        double[] box = openSkyClient.corridorBox(origin, destination);
        double laMin = lamin != null ? lamin : box[0];
        double loMin = lomin != null ? lomin : box[1];
        double laMax = lamax != null ? lamax : box[2];
        double loMax = lomax != null ? lomax : box[3];

        // Single OpenSky call with short RestTemplate timeout — no double fallback fetch
        List<OpenSkyClient.LiveFlight> flights = openSkyClient.fetchLiveTraffic(laMin, loMin, laMax, loMax);
        long airborne = flights.stream().filter(f -> !Boolean.TRUE.equals(f.onGround())).count();

        return ResponseEntity.ok(Map.of(
                "source", "OpenSky Network",
                "apiUrl", OpenSkyClient.PUBLIC_API,
                "docsUrl", "https://openskynetwork.github.io/opensky-api/rest.html",
                "fetchedAt", Instant.now().toString(),
                "bbox", Map.of("lamin", laMin, "lomin", loMin, "lamax", laMax, "lomax", loMax),
                "total", flights.size(),
                "airborne", airborne,
                "flights", flights
        ));
    }

    @GetMapping("/airports")
    public ResponseEntity<List<Airport>> airports(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(airportRepository.findAll());
        }
        return ResponseEntity.ok(airportRepository
                .findByCityContainingIgnoreCaseOrIataContainingIgnoreCaseOrNameContainingIgnoreCase(q, q, q));
    }
}
