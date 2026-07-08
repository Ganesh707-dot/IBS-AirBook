package com.ibs.airbook.order;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.create(request));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> list() {
        return ResponseEntity.ok(orderService.listForCurrentUser());
    }

    @PostMapping("/checkin/{ref}")
    public ResponseEntity<OrderResponse> checkIn(@PathVariable String ref) {
        return ResponseEntity.ok(orderService.checkIn(ref));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "iRetail AirBook API"));
    }
}
