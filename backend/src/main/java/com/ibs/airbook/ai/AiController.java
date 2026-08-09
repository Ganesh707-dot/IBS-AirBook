package com.ibs.airbook.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiBiService aiBiService;

    public record AskRequest(@NotBlank String question) {}

    @GetMapping("/insights")
    public ResponseEntity<List<AiBiService.AiInsight>> insights() {
        return ResponseEntity.ok(aiBiService.generateInsights());
    }

    @PostMapping("/ask")
    public ResponseEntity<AiBiService.AiChatResponse> ask(@RequestBody AskRequest request) {
        return ResponseEntity.ok(aiBiService.ask(request.question()));
    }

    @GetMapping("/ancillary-recommendations")
    public ResponseEntity<List<AiBiService.AncillaryRecommendation>> ancillaries(
            @RequestParam(defaultValue = "COK") String origin,
            @RequestParam(defaultValue = "DXB") String destination,
            @RequestParam(defaultValue = "ECONOMY") String fareFamily) {
        return ResponseEntity.ok(aiBiService.recommendAncillaries(origin, destination, fareFamily));
    }

    @GetMapping("/demand-forecast")
    public ResponseEntity<Map<String, Object>> forecast(
            @RequestParam String origin,
            @RequestParam String destination) {
        return ResponseEntity.ok(aiBiService.demandForecast(origin, destination));
    }
}
