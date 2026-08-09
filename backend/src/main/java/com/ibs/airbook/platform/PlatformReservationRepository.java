package com.ibs.airbook.platform;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlatformReservationRepository extends JpaRepository<PlatformReservation, Long> {
    List<PlatformReservation> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
}
