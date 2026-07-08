package com.ibs.airbook.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String bookingReference,
        Long routeId,
        String passengerName,
        String passengerEmail,
        Integer passengers,
        BigDecimal totalAmount,
        String ancillaryCodes,
        String status,
        LocalDateTime createdAt,
        LocalDateTime checkedInAt
) {
    static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(), order.getBookingReference(), order.getRouteId(),
                order.getPassengerName(), order.getPassengerEmail(), order.getPassengers(),
                order.getTotalAmount(), order.getAncillaryCodes(),
                order.getStatus().name(), order.getCreatedAt(), order.getCheckedInAt()
        );
    }
}
