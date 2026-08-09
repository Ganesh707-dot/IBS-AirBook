package com.ibs.airbook.settle;

import com.ibs.airbook.order.Order;
import com.ibs.airbook.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettleService {

    private final OrderRepository orderRepository;

    @Transactional
    public SettleResponse settle(SettleRequest request) {
        Order order = orderRepository.findByBookingReference(request.bookingReference())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!order.getCustomerEmail().equals(currentUserEmail())) {
            throw new IllegalArgumentException("Unauthorized settlement");
        }
        if (order.getStatus() == Order.OrderStatus.SETTLED
                || order.getStatus() == Order.OrderStatus.CHECKED_IN) {
            throw new IllegalArgumentException("Order already settled");
        }
        if (order.getStatus() != Order.OrderStatus.PENDING_PAYMENT) {
            throw new IllegalArgumentException("Order is not awaiting payment");
        }

        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        order.setStatus(Order.OrderStatus.SETTLED);
        order.setPaymentId(paymentId);
        order.setPaymentMethod(request.paymentMethod());
        order.setSettledAt(LocalDateTime.now());
        orderRepository.save(order);

        return new SettleResponse(
                order.getBookingReference(),
                paymentId,
                request.paymentMethod(),
                order.getTotalAmount(),
                "INR",
                "SETTLED",
                order.getSettledAt()
        );
    }

    private String currentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
