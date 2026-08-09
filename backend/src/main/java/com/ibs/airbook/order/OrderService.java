package com.ibs.airbook.order;

import com.ibs.airbook.catalog.Ancillary;
import com.ibs.airbook.catalog.AncillaryRepository;
import com.ibs.airbook.offer.Route;
import com.ibs.airbook.offer.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final RouteRepository routeRepository;
    private final AncillaryRepository ancillaryRepository;

    @Transactional
    public OrderResponse create(CreateOrderRequest request) {
        Route route = routeRepository.findById(request.routeId())
                .orElseThrow(() -> new IllegalArgumentException("Route not found"));

        if (route.getAvailableSeats() < request.passengers()) {
            throw new IllegalArgumentException("Not enough seats available");
        }

        BigDecimal total = route.getBasePrice().multiply(BigDecimal.valueOf(request.passengers()));
        List<String> codes = request.ancillaryCodes() != null ? request.ancillaryCodes() : List.of();

        for (String code : codes) {
            Ancillary ancillary = ancillaryRepository.findByCode(code)
                    .orElseThrow(() -> new IllegalArgumentException("Ancillary not found: " + code));
            total = total.add(ancillary.getPrice().multiply(BigDecimal.valueOf(request.passengers())));
        }

        route.setAvailableSeats(route.getAvailableSeats() - request.passengers());
        routeRepository.save(route);

        Order order = Order.builder()
                .bookingReference("AB" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customerEmail(currentUserEmail())
                .routeId(route.getId())
                .passengerName(request.passengerName())
                .passengerEmail(request.passengerEmail())
                .passengers(request.passengers())
                .totalAmount(total)
                .ancillaryCodes(String.join(",", codes))
                .status(Order.OrderStatus.PENDING_PAYMENT)
                .createdAt(LocalDateTime.now())
                .build();

        return OrderResponse.from(orderRepository.save(order));
    }

    public List<OrderResponse> listForCurrentUser() {
        return orderRepository.findByCustomerEmailOrderByCreatedAtDesc(currentUserEmail())
                .stream().map(OrderResponse::from).toList();
    }

    @Transactional
    public OrderResponse checkIn(String bookingReference) {
        Order order = orderRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!order.getCustomerEmail().equals(currentUserEmail())) {
            throw new IllegalArgumentException("Unauthorized check-in");
        }
        if (order.getStatus() == Order.OrderStatus.CHECKED_IN) {
            throw new IllegalArgumentException("Already checked in");
        }
        if (order.getStatus() != Order.OrderStatus.SETTLED) {
            throw new IllegalArgumentException("Payment must be settled before check-in");
        }

        order.setStatus(Order.OrderStatus.CHECKED_IN);
        order.setCheckedInAt(LocalDateTime.now());
        return OrderResponse.from(orderRepository.save(order));
    }

    private String currentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
