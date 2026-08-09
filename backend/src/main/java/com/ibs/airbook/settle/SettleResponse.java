package com.ibs.airbook.settle;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SettleResponse(
        String bookingReference,
        String paymentId,
        String paymentMethod,
        BigDecimal amount,
        String currency,
        String status,
        LocalDateTime settledAt
) {}
