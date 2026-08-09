package com.ibs.airbook.analytics;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/kpis")
    public ResponseEntity<AnalyticsService.KpiSnapshot> kpis() {
        return ResponseEntity.ok(analyticsService.kpis());
    }

    @GetMapping("/revenue-trend")
    public ResponseEntity<List<AnalyticsService.TimeSeriesPoint>> trend(
            @RequestParam(defaultValue = "14") int days) {
        return ResponseEntity.ok(analyticsService.revenueTrend(Math.min(days, 60)));
    }

    @GetMapping("/top-routes")
    public ResponseEntity<List<AnalyticsService.RouteRevenue>> topRoutes(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(analyticsService.topRoutes(limit));
    }

    @GetMapping("/oosd-funnel")
    public ResponseEntity<List<AnalyticsService.StatusFunnel>> funnel() {
        return ResponseEntity.ok(analyticsService.oosdFunnel());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(Map.of(
                "kpis", analyticsService.kpis(),
                "revenueTrend", analyticsService.revenueTrend(14),
                "topRoutes", analyticsService.topRoutes(8),
                "oosdFunnel", analyticsService.oosdFunnel()
        ));
    }
}
