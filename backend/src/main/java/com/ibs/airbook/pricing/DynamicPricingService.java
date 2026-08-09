package com.ibs.airbook.pricing;

import com.ibs.airbook.integration.fx.FrankfurterClient;
import com.ibs.airbook.integration.opensky.OpenSkyClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

/**
 * Dynamic revenue management style pricing — demand, DOW, lead time, FX, fare family.
 */
@Service
@RequiredArgsConstructor
public class DynamicPricingService {

    private final FrankfurterClient frankfurterClient;
    private final OpenSkyClient openSkyClient;

    private static final Map<String, Double> BASE_EUR = Map.ofEntries(
            Map.entry("SHORT", 85.0),
            Map.entry("MEDIUM", 180.0),
            Map.entry("LONG", 420.0),
            Map.entry("ULTRA", 680.0)
    );

    private static final Map<String, Double> FARE_MULTIPLIER = Map.of(
            "ECONOMY", 1.0,
            "PREMIUM", 1.45,
            "BUSINESS", 2.35,
            "FIRST", 3.8
    );

    public record PriceQuote(
            BigDecimal amountInr,
            BigDecimal eurInrRate,
            int demandScore,
            double dowFactor,
            double leadTimeFactor,
            String band
    ) {}

    public PriceQuote quote(String origin, String destination, LocalDate travelDate,
                            String fareFamily, int durationMinutes) {
        String band = durationBand(durationMinutes);
        double baseEur = BASE_EUR.getOrDefault(band, 200.0);
        BigDecimal fx = frankfurterClient.eurToInr();
        int demand = openSkyClient.estimateCorridorDemand(origin, destination);
        double demandFactor = 0.85 + (demand / 100.0) * 0.55;
        double dowFactor = dowFactor(travelDate.getDayOfWeek());
        long daysOut = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), travelDate));
        double leadTimeFactor = daysOut < 3 ? 1.45 : daysOut < 7 ? 1.25 : daysOut < 21 ? 1.05 : 0.92;
        double fareMult = FARE_MULTIPLIER.getOrDefault(fareFamily, 1.0);

        BigDecimal inr = BigDecimal.valueOf(baseEur * demandFactor * dowFactor * leadTimeFactor * fareMult)
                .multiply(fx)
                .setScale(0, RoundingMode.HALF_UP);

        return new PriceQuote(inr, fx, demand, dowFactor, leadTimeFactor, band);
    }

    private String durationBand(int minutes) {
        if (minutes < 180) return "SHORT";
        if (minutes < 420) return "MEDIUM";
        if (minutes < 720) return "LONG";
        return "ULTRA";
    }

    private double dowFactor(DayOfWeek day) {
        return switch (day) {
            case FRIDAY, SUNDAY -> 1.18;
            case SATURDAY -> 1.12;
            case MONDAY -> 1.08;
            default -> 1.0;
        };
    }
}
