package com.ibs.airbook.order;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingReference;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private Long routeId;

    @Column(nullable = false)
    private String passengerName;

    @Column(nullable = false)
    private String passengerEmail;

    @Column(nullable = false)
    private Integer passengers;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private String ancillaryCodes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime checkedInAt;

    public enum OrderStatus {
        CONFIRMED, CHECKED_IN, CANCELLED
    }
}
