package com.ibs.airbook.order;

import jakarta.validation.constraints.*;

import java.util.List;

public record CreateOrderRequest(
        @NotNull Long routeId,
        @NotBlank String passengerName,
        @NotBlank @Email String passengerEmail,
        @Min(1) @Max(9) Integer passengers,
        List<String> ancillaryCodes
) {}
