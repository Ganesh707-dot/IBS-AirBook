package com.ibs.airbook.deliver;

import com.ibs.airbook.offer.Route;
import com.ibs.airbook.offer.RouteRepository;
import com.ibs.airbook.order.Order;
import com.ibs.airbook.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DeliverService {

    private final OrderRepository orderRepository;
    private final RouteRepository routeRepository;

    public BoardingPassResponse getBoardingPass(String bookingReference) {
        Order order = orderRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!order.getCustomerEmail().equals(currentUserEmail())) {
            throw new IllegalArgumentException("Unauthorized boarding pass access");
        }
        if (order.getStatus() != Order.OrderStatus.CHECKED_IN) {
            throw new IllegalArgumentException("Complete check-in before downloading boarding pass");
        }

        Route route = routeRepository.findById(order.getRouteId())
                .orElseThrow(() -> new IllegalArgumentException("Flight not found"));

        int seatRow = 12 + (int) (order.getId() % 20);
        String seatLetter = String.valueOf((char) ('A' + (int) (order.getId() % 6)));
        String seat = seatRow + seatLetter;
        String gate = "G" + (3 + (int) (order.getId() % 12));
        String group = order.getId() % 2 == 0 ? "A" : "B";
        String barcode = "M1" + order.getPassengerName().replace(" ", "").toUpperCase(Locale.ROOT)
                + order.getBookingReference() + route.getFlightNumber();

        return new BoardingPassResponse(
                order.getBookingReference(),
                order.getPassengerName(),
                route.getFlightNumber(),
                route.getOrigin(),
                route.getDestination(),
                route.getDepartureTime(),
                route.getArrivalTime(),
                seat,
                gate,
                group,
                barcode,
                route.getFareFamily(),
                order.getCheckedInAt() != null ? order.getCheckedInAt() : LocalDateTime.now()
        );
    }

    private String currentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
