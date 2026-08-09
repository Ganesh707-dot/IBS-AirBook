package com.ibs.airbook.settle;

import jakarta.validation.constraints.NotBlank;

public record SettleRequest(
        @NotBlank String bookingReference,
        @NotBlank String paymentMethod
) {}
