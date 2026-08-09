package com.ibs.airbook.offer;

import com.ibs.airbook.catalog.Airport;
import com.ibs.airbook.catalog.AirportRepository;
import com.ibs.airbook.integration.fx.FrankfurterClient;
import com.ibs.airbook.pricing.DynamicPricingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OfferService {

    private static final DateTimeFormatter HHMM = DateTimeFormatter.ofPattern("HH:mm");
    private static final String[] CARRIERS = {"AirBook", "SkyLine", "IndigoJet", "GulfLink", "EuroWing"};
    private static final String[] FARE_FAMILIES = {"ECONOMY", "ECONOMY", "ECONOMY", "PREMIUM", "BUSINESS"};

    private final RouteRepository routeRepository;
    private final AirportRepository airportRepository;
    private final DynamicPricingService pricingService;
    private final FrankfurterClient frankfurterClient;

    @Transactional
    public List<OfferResponse> search(String origin, String destination, LocalDate travelDate) {
        String o = origin.toUpperCase();
        String d = destination.toUpperCase();
        LocalDate date = travelDate != null ? travelDate : LocalDate.now().plusDays(7);

        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Travel date cannot be in the past");
        }
        if (o.equals(d)) {
            throw new IllegalArgumentException("Origin and destination must differ");
        }

        Airport from = airportRepository.findById(o)
                .orElseThrow(() -> new IllegalArgumentException("Unknown origin airport: " + o));
        Airport to = airportRepository.findById(d)
                .orElseThrow(() -> new IllegalArgumentException("Unknown destination airport: " + d));

        if (routeRepository.countByOriginAndDestinationAndTravelDate(o, d, date) == 0) {
            generateDynamicOffers(from, to, date);
        }

        return routeRepository.searchOffers(o, d, date).stream().map(OfferResponse::from).toList();
    }

    public OfferResponse getById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + id));
        return OfferResponse.from(route);
    }

    private void generateDynamicOffers(Airport from, Airport to, LocalDate travelDate) {
        int duration = estimateDurationMinutes(from, to);
        int flights = 3 + ThreadLocalRandom.current().nextInt(3);
        // Demand uses fast local signal so search never waits on OpenSky timeouts.
        // Live ADS-B remains available on /api/market/live-flights for the tracker.
        int demand = 45 + Math.abs((from.getIata() + "-" + to.getIata()).hashCode() % 40);
        BigDecimal fx = frankfurterClient.eurToInr();
        List<Route> batch = new ArrayList<>();

        for (int i = 0; i < flights; i++) {
            String fare = FARE_FAMILIES[ThreadLocalRandom.current().nextInt(FARE_FAMILIES.length)];
            var quote = pricingService.quote(from.getIata(), to.getIata(), travelDate, fare, duration, demand, fx);
            LocalTime dep = LocalTime.of(5 + i * 3 + ThreadLocalRandom.current().nextInt(2),
                    ThreadLocalRandom.current().nextInt(0, 12) * 5);
            LocalTime arr = dep.plusMinutes(duration);
            String carrier = CARRIERS[ThreadLocalRandom.current().nextInt(CARRIERS.length)];
            String flightNo = carrier.substring(0, 2).toUpperCase() + (100 + ThreadLocalRandom.current().nextInt(800));
            int seats = switch (fare) {
                case "BUSINESS" -> 12 + ThreadLocalRandom.current().nextInt(20);
                case "PREMIUM" -> 24 + ThreadLocalRandom.current().nextInt(30);
                default -> 80 + ThreadLocalRandom.current().nextInt(120);
            };
            String status = quote.demandScore() > 75 ? "HIGH_DEMAND"
                    : quote.demandScore() > 50 ? "BALANCED" : "SOFT";

            batch.add(Route.builder()
                    .origin(from.getIata()).destination(to.getIata())
                    .airline(carrier).flightNumber(flightNo)
                    .travelDate(travelDate)
                    .departureTime(dep.format(HHMM)).arrivalTime(arr.format(HHMM))
                    .durationMinutes(duration)
                    .basePrice(quote.amountInr()).currency("INR")
                    .fareFamily(fare).availableSeats(seats)
                    .demandScore(quote.demandScore()).marketStatus(status)
                    .eurInrRate(quote.eurInrRate()).generatedAt(LocalDateTime.now())
                    .build());
        }
        routeRepository.saveAll(batch);
    }

    private int estimateDurationMinutes(Airport from, Airport to) {
        double distKm = haversineKm(from.getLatitude(), from.getLongitude(), to.getLatitude(), to.getLongitude());
        return (int) Math.round((distKm / 780.0) * 60.0) + 45;
    }

    private double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * r * Math.asin(Math.sqrt(a));
    }
}
