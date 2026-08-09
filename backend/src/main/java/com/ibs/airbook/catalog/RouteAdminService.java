package com.ibs.airbook.catalog;

import com.ibs.airbook.offer.Route;
import com.ibs.airbook.offer.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RouteAdminService {

    private final RouteRepository routeRepository;

    public List<CatalogController.RouteDto> listAll() {
        return routeRepository.findAll().stream().map(this::toDto).toList();
    }

    public CatalogController.RouteDto create(CatalogController.CreateRouteRequest request) {
        Route route = Route.builder()
                .origin(request.origin().toUpperCase())
                .destination(request.destination().toUpperCase())
                .airline(request.airline())
                .flightNumber(request.flightNumber())
                .travelDate(request.travelDate() != null ? request.travelDate() : LocalDate.now().plusDays(7))
                .departureTime(request.departureTime())
                .arrivalTime(request.arrivalTime())
                .durationMinutes(request.durationMinutes())
                .basePrice(request.basePrice())
                .currency("INR")
                .fareFamily(request.fareFamily())
                .availableSeats(request.availableSeats())
                .demandScore(50)
                .marketStatus("MANUAL")
                .generatedAt(LocalDateTime.now())
                .build();
        return toDto(routeRepository.save(route));
    }

    private CatalogController.RouteDto toDto(Route r) {
        return new CatalogController.RouteDto(
                r.getId(), r.getOrigin(), r.getDestination(), r.getAirline(),
                r.getFlightNumber(), r.getTravelDate(), r.getDepartureTime(), r.getArrivalTime(),
                r.getDurationMinutes(), r.getBasePrice(), r.getCurrency(), r.getFareFamily(),
                r.getAvailableSeats(), r.getDemandScore(), r.getMarketStatus()
        );
    }
}
