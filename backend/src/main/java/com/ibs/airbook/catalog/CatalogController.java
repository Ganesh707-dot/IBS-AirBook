package com.ibs.airbook.catalog;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final RouteAdminService routeAdminService;
    private final AncillaryRepository ancillaryRepository;

    @GetMapping("/routes")
    public ResponseEntity<List<RouteDto>> listRoutes() {
        return ResponseEntity.ok(routeAdminService.listAll());
    }

    @PostMapping("/routes")
    public ResponseEntity<RouteDto> createRoute(@Valid @RequestBody CreateRouteRequest request) {
        return ResponseEntity.ok(routeAdminService.create(request));
    }

    @GetMapping("/ancillaries")
    public ResponseEntity<List<AncillaryDto>> listAncillaries() {
        List<AncillaryDto> ancillaries = ancillaryRepository.findAll().stream()
                .map(AncillaryDto::from)
                .toList();
        return ResponseEntity.ok(ancillaries);
    }

    public record AncillaryDto(Long id, String code, String name, String description,
                               BigDecimal price, String category) {
        static AncillaryDto from(Ancillary a) {
            return new AncillaryDto(a.getId(), a.getCode(), a.getName(),
                    a.getDescription(), a.getPrice(), a.getCategory());
        }
    }

    public record RouteDto(Long id, String origin, String destination, String airline,
                           String flightNumber, LocalDate travelDate, String departureTime, String arrivalTime,
                           Integer durationMinutes, BigDecimal basePrice, String currency, String fareFamily,
                           Integer availableSeats, Integer demandScore, String marketStatus) {}

    public record CreateRouteRequest(
            @NotBlank @Size(min = 3, max = 3) String origin,
            @NotBlank @Size(min = 3, max = 3) String destination,
            @NotBlank String airline,
            @NotBlank String flightNumber,
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate travelDate,
            @NotBlank String departureTime,
            @NotBlank String arrivalTime,
            @NotNull @Min(1) Integer durationMinutes,
            @NotNull @DecimalMin("0.01") BigDecimal basePrice,
            @NotBlank String fareFamily,
            @NotNull @Min(1) Integer availableSeats
    ) {}
}
