package com.ibs.airbook.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping("/search")
    public ResponseEntity<List<OfferResponse>> search(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate travelDate) {
        return ResponseEntity.ok(offerService.search(origin, destination, travelDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfferResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getById(id));
    }
}
