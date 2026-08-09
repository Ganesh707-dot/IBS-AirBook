package com.ibs.airbook.offer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OfferResponse(
        Long id,
        String origin,
        String destination,
        String airline,
        String flightNumber,
        LocalDate travelDate,
        String departureTime,
        String arrivalTime,
        Integer durationMinutes,
        BigDecimal basePrice,
        String currency,
        String fareFamily,
        Integer availableSeats,
        Integer demandScore,
        String marketStatus,
        BigDecimal eurInrRate
) {
    static OfferResponse from(Route route) {
        return new OfferResponse(
                route.getId(), route.getOrigin(), route.getDestination(),
                route.getAirline(), route.getFlightNumber(), route.getTravelDate(),
                route.getDepartureTime(), route.getArrivalTime(),
                route.getDurationMinutes(), route.getBasePrice(), route.getCurrency(),
                route.getFareFamily(), route.getAvailableSeats(),
                route.getDemandScore(), route.getMarketStatus(), route.getEurInrRate()
        );
    }
}
