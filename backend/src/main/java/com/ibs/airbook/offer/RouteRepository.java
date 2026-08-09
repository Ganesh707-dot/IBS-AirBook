package com.ibs.airbook.offer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {

    @Query("""
            SELECT r FROM Route r
            WHERE r.origin = :origin AND r.destination = :destination
              AND r.travelDate = :travelDate AND r.availableSeats > 0
            ORDER BY r.basePrice ASC
            """)
    List<Route> searchOffers(@Param("origin") String origin,
                             @Param("destination") String destination,
                             @Param("travelDate") LocalDate travelDate);

    long countByOriginAndDestinationAndTravelDate(String origin, String destination, LocalDate travelDate);

    @Query("SELECT r.origin, r.destination, COUNT(r), AVG(r.basePrice), AVG(r.demandScore) FROM Route r GROUP BY r.origin, r.destination")
    List<Object[]> routeMarketStats();
}
