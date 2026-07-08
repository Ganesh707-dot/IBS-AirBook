package com.ibs.airbook.offer;

import java.math.BigDecimal;

public record OfferResponse(
        Long id,
        String origin,
        String destination,
        String airline,
        String flightNumber,
        String departureTime,
        String arrivalTime,
        Integer durationMinutes,
        BigDecimal basePrice,
        String fareFamily,
        Integer availableSeats
) {
    static OfferResponse from(Route route) {
        return new OfferResponse(
                route.getId(), route.getOrigin(), route.getDestination(),
                route.getAirline(), route.getFlightNumber(),
                route.getDepartureTime(), route.getArrivalTime(),
                route.getDurationMinutes(), route.getBasePrice(),
                route.getFareFamily(), route.getAvailableSeats()
        );
    }
}
