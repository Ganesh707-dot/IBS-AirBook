package com.ibs.airbook.deliver;

import java.time.LocalDateTime;

public record BoardingPassResponse(
        String bookingReference,
        String passengerName,
        String flightNumber,
        String origin,
        String destination,
        String departureTime,
        String arrivalTime,
        String seatNumber,
        String gate,
        String boardingGroup,
        String barcode,
        String fareFamily,
        LocalDateTime issuedAt
) {}
