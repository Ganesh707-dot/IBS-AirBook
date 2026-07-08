package com.ibs.airbook.offer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OfferServiceTest {

    @Autowired
    private OfferService offerService;

    @Test
    void searchReturnsOffersForValidRoute() {
        List<OfferResponse> offers = offerService.search("COK", "DXB");
        assertFalse(offers.isEmpty());
        assertEquals("COK", offers.get(0).origin());
        assertEquals("DXB", offers.get(0).destination());
    }

    @Test
    void searchReturnsEmptyForUnknownRoute() {
        List<OfferResponse> offers = offerService.search("XXX", "YYY");
        assertTrue(offers.isEmpty());
    }
}
