package com.ibs.airbook.platform;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/platform")
@RequiredArgsConstructor
public class PlatformController {

    private final PlatformService platformService;

    @GetMapping("/solutions")
    public ResponseEntity<List<PlatformService.SolutionDto>> solutions() {
        return ResponseEntity.ok(platformService.solutions());
    }

    @GetMapping("/stays")
    public ResponseEntity<List<PlatformService.StayDto>> stays(
            @RequestParam(required = false) String hub,
            @RequestParam(required = false) String tier) {
        var list = platformService.stays().stream()
                .filter(s -> hub == null || hub.isBlank() || s.hubAirport().equalsIgnoreCase(hub))
                .filter(s -> tier == null || tier.isBlank() || s.tier().equalsIgnoreCase(tier))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/cruises")
    public ResponseEntity<List<PlatformService.CruiseDto>> cruises(
            @RequestParam(required = false) String tier) {
        var list = platformService.cruises().stream()
                .filter(c -> tier == null || tier.isBlank() || c.tier().equalsIgnoreCase(tier))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/cargo/lanes")
    public ResponseEntity<List<PlatformService.CargoLaneDto>> cargo() {
        return ResponseEntity.ok(platformService.cargoLanes());
    }

    @GetMapping("/loyalty/tiers")
    public ResponseEntity<List<PlatformService.LoyaltyTierDto>> tiers() {
        return ResponseEntity.ok(platformService.loyaltyTiers());
    }

    @GetMapping("/loyalty/partners")
    public ResponseEntity<List<PlatformService.LoyaltyPartnerDto>> partners() {
        return ResponseEntity.ok(platformService.loyaltyPartners());
    }

    @GetMapping("/loyalty")
    public ResponseEntity<Map<String, Object>> loyalty() {
        return ResponseEntity.ok(Map.of(
                "program", "AirBook Rewards",
                "tiers", platformService.loyaltyTiers(),
                "partners", platformService.loyaltyPartners()
        ));
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<PlatformService.ReservationDto>> reservations() {
        return ResponseEntity.ok(platformService.reservationsForCurrentUser());
    }

    @PostMapping("/stays/{id}/book")
    public ResponseEntity<PlatformService.ReservationDto> bookStay(@PathVariable String id) {
        return ResponseEntity.ok(platformService.bookStay(id));
    }

    @PostMapping("/cruises/{id}/book")
    public ResponseEntity<PlatformService.ReservationDto> bookCruise(@PathVariable String id) {
        return ResponseEntity.ok(platformService.bookCruise(id));
    }

    public record ConciergeAsk(@NotBlank String question, String locale) {}

    @PostMapping("/concierge/ask")
    public ResponseEntity<PlatformService.ConciergeResponse> concierge(@RequestBody ConciergeAsk body) {
        return ResponseEntity.ok(platformService.askConcierge(body.question(), body.locale()));
    }
}
