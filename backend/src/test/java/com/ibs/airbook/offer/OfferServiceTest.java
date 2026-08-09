package com.ibs.airbook.offer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OfferServiceTest {

    @Autowired
    private OfferService offerService;

    @Test
    void searchReturnsDynamicOffersForValidRoute() {
        List<OfferResponse> offers = offerService.search("COK", "DXB", LocalDate.now().plusDays(10));
        assertFalse(offers.isEmpty());
        assertEquals("COK", offers.get(0).origin());
        assertEquals("DXB", offers.get(0).destination());
        assertNotNull(offers.get(0).demandScore());
        assertEquals("INR", offers.get(0).currency());
    }

    @Test
    void searchRejectsUnknownAirport() {
        assertThrows(IllegalArgumentException.class,
                () -> offerService.search("XXX", "YYY", LocalDate.now().plusDays(3)));
    }
}
