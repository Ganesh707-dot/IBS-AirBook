package com.ibs.airbook.catalog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AncillaryRepository extends JpaRepository<Ancillary, Long> {
    Optional<Ancillary> findByCode(String code);
}
