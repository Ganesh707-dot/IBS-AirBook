package com.ibs.airbook.integration.fx;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Free FX rates from Frankfurter (ECB) — https://www.frankfurter.app/
 * No API key required.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FrankfurterClient {

    public static final String API = "https://api.frankfurter.app/latest?from=EUR&to=INR";

    private final RestTemplate restTemplate;

    @Cacheable("fxRates")
    @SuppressWarnings("unchecked")
    public BigDecimal eurToInr() {
        try {
            Map<String, Object> body = restTemplate.getForObject(API, Map.class);
            if (body != null && body.get("rates") instanceof Map<?, ?> rates) {
                Object inr = rates.get("INR");
                if (inr != null) {
                    return new BigDecimal(inr.toString()).setScale(4, RoundingMode.HALF_UP);
                }
            }
        } catch (Exception e) {
            log.warn("Frankfurter FX unavailable, using fallback rate: {}", e.getMessage());
        }
        return BigDecimal.valueOf(90.0);
    }

    public BigDecimal convertEurToInr(BigDecimal eur) {
        return eur.multiply(eurToInr()).setScale(0, RoundingMode.HALF_UP);
    }
}
