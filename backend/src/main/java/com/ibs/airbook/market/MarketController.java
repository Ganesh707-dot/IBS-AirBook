package com.ibs.airbook.market;

import com.ibs.airbook.catalog.Airport;
import com.ibs.airbook.catalog.AirportRepository;
import com.ibs.airbook.integration.fx.FrankfurterClient;
import com.ibs.airbook.integration.opensky.OpenSkyClient;
import com.ibs.airbook.integration.weather.OpenMeteoClient;
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
    private final OpenMeteoClient openMeteoClient;
    private final AirportRepository airportRepository;

    @GetMapping("/pulse")
    public ResponseEntity<Map<String, Object>> pulse(
            @RequestParam(defaultValue = "COK") String origin,
            @RequestParam(defaultValue = "DXB") String destination) {
        String o = origin.toUpperCase();
        String d = destination.toUpperCase();
        int demand = openSkyClient.estimateCorridorDemand(o, d);
        BigDecimal fx = frankfurterClient.eurToInr();
        var destWx = weatherAt(d);
        return ResponseEntity.ok(Map.of(
                "origin", o,
                "destination", d,
                "demandScore", demand,
                "eurInr", fx,
                "destinationWeather", destWx,
                "sources", List.of(
                        OpenSkyClient.PUBLIC_API,
                        FrankfurterClient.API,
                        OpenMeteoClient.API
                ),
                "openSkyApi", OpenSkyClient.PUBLIC_API
        ));
    }

    private Map<String, Object> weatherAt(String iata) {
        return airportRepository.findById(iata).map(this::weatherForAirport).orElse(Map.of(
                "iata", iata, "summary", "Weather unavailable", "source", OpenMeteoClient.API
        ));
    }

    private Map<String, Object> weatherForAirport(Airport ap) {
        var wx = openMeteoClient.current(ap.getLatitude(), ap.getLongitude());
        return Map.of(
                "iata", ap.getIata(),
                "city", ap.getCity(),
                "temperatureC", wx.temperatureC(),
                "condition", openMeteoClient.describeCode(wx.weatherCode()),
                "windKmh", wx.windKmh(),
                "source", wx.source()
        );
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
