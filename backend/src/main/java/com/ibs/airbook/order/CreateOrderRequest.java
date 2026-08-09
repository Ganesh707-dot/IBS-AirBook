package com.ibs.airbook.order;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CreateOrderRequest(
        @NotNull(message = "routeId is required") Long routeId,
        @NotBlank(message = "Passenger name is required") String passengerName,
        @NotBlank(message = "Passenger email is required") @Email(message = "Invalid passenger email") String passengerEmail,
        @NotNull(message = "passengers is required") @Min(value = 1, message = "At least 1 passenger") @Max(value = 9, message = "Max 9 passengers") Integer passengers,
        List<String> ancillaryCodes
) {}
