package com.ibs.airbook.offer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RouteRepository extends JpaRepository<Route, Long> {

    @Query("SELECT r FROM Route r WHERE r.origin = :origin AND r.destination = :destination AND r.availableSeats > 0")
    List<Route> searchOffers(@Param("origin") String origin, @Param("destination") String destination);
}
