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
        String paymentId,
        String paymentMethod,
        LocalDateTime createdAt,
        LocalDateTime settledAt,
        LocalDateTime checkedInAt
) {
    static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(), order.getBookingReference(), order.getRouteId(),
                order.getPassengerName(), order.getPassengerEmail(), order.getPassengers(),
                order.getTotalAmount(), order.getAncillaryCodes(),
                order.getStatus().name(), order.getPaymentId(), order.getPaymentMethod(),
                order.getCreatedAt(), order.getSettledAt(), order.getCheckedInAt()
        );
    }
}
