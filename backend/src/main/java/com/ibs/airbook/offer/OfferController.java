package com.ibs.airbook.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping("/search")
    public ResponseEntity<List<OfferResponse>> search(
            @RequestParam String origin,
            @RequestParam String destination) {
        return ResponseEntity.ok(offerService.search(origin, destination));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getById(id));
    }
}
