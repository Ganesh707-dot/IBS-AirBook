package com.ibs.airbook.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AirportRepository extends JpaRepository<Airport, String> {
    List<Airport> findByCityContainingIgnoreCaseOrIataContainingIgnoreCaseOrNameContainingIgnoreCase(
            String city, String iata, String name);
}
