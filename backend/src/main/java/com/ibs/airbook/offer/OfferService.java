package com.ibs.airbook.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final RouteRepository routeRepository;

    public List<OfferResponse> search(String origin, String destination) {
        return routeRepository.searchOffers(origin.toUpperCase(), destination.toUpperCase())
                .stream()
                .map(OfferResponse::from)
                .toList();
    }

    public OfferResponse getById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found: " + id));
        return OfferResponse.from(route);
    }
}
