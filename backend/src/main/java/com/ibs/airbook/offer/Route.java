package com.ibs.airbook.offer;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 3)
    private String origin;

    @Column(nullable = false, length = 3)
    private String destination;

    @Column(nullable = false)
    private String airline;

    @Column(nullable = false)
    private String flightNumber;

    @Column(nullable = false)
    private String departureTime;

    @Column(nullable = false)
    private String arrivalTime;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private String fareFamily;

    @Column(nullable = false)
    private Integer availableSeats;
}
