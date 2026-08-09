package com.ibs.airbook.ai;

import com.ibs.airbook.analytics.AnalyticsService;
import com.ibs.airbook.catalog.Ancillary;
import com.ibs.airbook.catalog.AncillaryRepository;
import com.ibs.airbook.integration.opensky.OpenSkyClient;
import com.ibs.airbook.offer.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Enterprise AI BI layer: deterministic analyst + optional Groq LLM (free tier).
 * Set GROQ_API_KEY for generative narratives; otherwise uses on-box retail intelligence.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiBiService {

    private final AnalyticsService analyticsService;
    private final AncillaryRepository ancillaryRepository;
    private final RouteRepository routeRepository;
    private final OpenSkyClient openSkyClient;
    private final RestTemplate restTemplate;

    @Value("${airbook.ai.groq-api-key:}")
    private String groqApiKey;

    @Value("${airbook.ai.groq-model:llama-3.1-8b-instant}")
    private String groqModel;

    public record AiInsight(String type, String title, String detail, double confidence) {}
    public record AiChatResponse(String answer, String mode, List<AiInsight> supportingInsights) {}
    public record AncillaryRecommendation(String code, String name, String reason, double score) {}

    public List<AiInsight> generateInsights() {
        var kpis = analyticsService.kpis();
        List<AiInsight> insights = new ArrayList<>();

        insights.add(new AiInsight("REVENUE", "GMV pulse",
                "Gross merchandise value is ₹" + kpis.grossMerchandiseValue()
                        + " across " + kpis.totalOrders() + " orders (AOV ₹" + kpis.averageOrderValue() + ").",
                0.92));

        if (kpis.settlementRate() < 70) {
            insights.add(new AiInsight("SETTLE", "Settlement leakage",
                    "Settlement rate at " + kpis.settlementRate()
                            + "%. Recommend payment retry nudges and UPI fallback in checkout.",
                    0.88));
        } else {
            insights.add(new AiInsight("SETTLE", "Healthy settlement",
                    "Settlement conversion is strong at " + kpis.settlementRate() + "%.",
                    0.9));
        }

        if (kpis.ancillaryAttachRate() < 45) {
            insights.add(new AiInsight("ANCILLARY", "Upsell opportunity",
                    "Ancillary attach rate " + kpis.ancillaryAttachRate()
                            + "%. Bundle BAG15+MEAL on Gulf corridors during high demand.",
                    0.86));
        } else {
            insights.add(new AiInsight("ANCILLARY", "Ancillary momentum",
                    "Attach rate " + kpis.ancillaryAttachRate() + "% — maintain personalized offers.",
                    0.84));
        }

        int demand = openSkyClient.estimateCorridorDemand("COK", "DXB");
        insights.add(new AiInsight("DEMAND", "Live corridor demand (OpenSky)",
                "COK–DXB corridor demand proxy score " + demand
                        + "/100 from live ADS-B density. Dynamic pricing engine already consumes this signal.",
                0.8));

        insights.add(new AiInsight("DELIVER", "Check-in conversion",
                "Check-in rate on settled orders: " + kpis.checkInRate()
                        + "%. Push pre-departure DCS reminders 24h before departure.",
                0.87));

        return insights;
    }

    public AiChatResponse ask(String question) {
        String q = question == null ? "" : question.trim();
        if (q.isBlank()) {
            throw new IllegalArgumentException("Question is required");
        }

        List<AiInsight> insights = generateInsights();
        String deterministic = buildDeterministicAnswer(q, insights);

        if (groqApiKey != null && !groqApiKey.isBlank()) {
            try {
                String llm = callGroq(q, insights);
                return new AiChatResponse(llm, "GROQ_LLM", insights);
            } catch (Exception e) {
                log.warn("Groq AI fallback to local analyst: {}", e.getMessage());
            }
        }
        return new AiChatResponse(deterministic, "LOCAL_RETAIL_ANALYST", insights);
    }

    public List<AncillaryRecommendation> recommendAncillaries(String origin, String destination, String fareFamily) {
        List<Ancillary> all = ancillaryRepository.findAll();
        int demand = openSkyClient.estimateCorridorDemand(
                origin == null ? "COK" : origin,
                destination == null ? "DXB" : destination);

        return all.stream().map(a -> {
            double score = 0.4;
            if ("BAGGAGE".equals(a.getCategory()) && demand > 60) score += 0.35;
            if ("MEAL".equals(a.getCategory())) score += 0.2;
            if ("PRIORITY".equals(a.getCategory()) && "BUSINESS".equalsIgnoreCase(fareFamily)) score += 0.3;
            if ("LOUNGE".equals(a.getCategory()) && ("BUSINESS".equalsIgnoreCase(fareFamily)
                    || "PREMIUM".equalsIgnoreCase(fareFamily))) score += 0.28;
            if ("SEAT".equals(a.getCategory())) score += 0.15;
            String reason = switch (a.getCategory()) {
                case "BAGGAGE" -> "High corridor demand increases checked-bag propensity.";
                case "MEAL" -> "Longer sectors and midday departures lift meal attach.";
                case "PRIORITY" -> "Business/premium passengers convert well on priority boarding.";
                case "LOUNGE" -> "Premium fare families show strong lounge affinity.";
                default -> "Baseline personalization lift from historical attach patterns.";
            };
            return new AncillaryRecommendation(a.getCode(), a.getName(), reason, Math.min(0.99, score));
        }).sorted(Comparator.comparing(AncillaryRecommendation::score).reversed()).toList();
    }

    public Map<String, Object> demandForecast(String origin, String destination) {
        int live = openSkyClient.estimateCorridorDemand(origin, destination);
        List<Map<String, Object>> horizon = new ArrayList<>();
        for (int d = 0; d < 7; d++) {
            double seasonal = 1.0 + 0.08 * Math.sin((System.currentTimeMillis() / 86400000.0 + d) / 2.5);
            int forecast = (int) Math.min(100, Math.round(live * seasonal + (d % 3) * 2));
            horizon.add(Map.of(
                    "dayOffset", d,
                    "demandIndex", forecast,
                    "pricingBias", forecast > 70 ? "YIELD_UP" : forecast < 45 ? "STIMULATE" : "HOLD"
            ));
        }
        return Map.of(
                "origin", origin.toUpperCase(),
                "destination", destination.toUpperCase(),
                "liveDemandScore", live,
                "model", "opensky-density + seasonal smoother",
                "horizon", horizon,
                "offerInventory", routeRepository.count()
        );
    }

    private String buildDeterministicAnswer(String q, List<AiInsight> insights) {
        var kpis = analyticsService.kpis();
        String lower = q.toLowerCase(Locale.ROOT);
        if (lower.contains("revenue") || lower.contains("gmv") || lower.contains("sales")) {
            return "Revenue view: GMV ₹" + kpis.grossMerchandiseValue()
                    + ", AOV ₹" + kpis.averageOrderValue()
                    + ", orders " + kpis.totalOrders()
                    + ". Focus yield actions on high-demand corridors flagged by OpenSky.";
        }
        if (lower.contains("ancillary") || lower.contains("upsell")) {
            return "Ancillary attach is " + kpis.ancillaryAttachRate()
                    + "%. Prioritize BAG15 and LOUNGE on premium fare families; use /api/ai/ancillary-recommendations for ranked SKUs.";
        }
        if (lower.contains("funnel") || lower.contains("oosd") || lower.contains("conversion")) {
            return "OOSD funnel health — settlement " + kpis.settlementRate()
                    + "%, check-in " + kpis.checkInRate()
                    + "%. Improve Settle→Deliver with 24h DCS nudges.";
        }
        if (lower.contains("demand") || lower.contains("forecast")) {
            return "Demand is computed live from OpenSky ADS-B corridor density plus DOW/lead-time pricing factors. Ask for a specific OD like COK-DXB forecast.";
        }
        String joined = insights.stream().map(i -> i.title() + ": " + i.detail())
                .reduce((a, b) -> a + " | " + b).orElse("No insights");
        return "AirBook retail analyst summary → " + joined;
    }

    @SuppressWarnings("unchecked")
    private String callGroq(String question, List<AiInsight> insights) {
        String context = insights.stream()
                .map(i -> "- [" + i.type() + "] " + i.title() + ": " + i.detail())
                .reduce((a, b) -> a + "\n" + b).orElse("");
        Map<String, Object> body = Map.of(
                "model", groqModel,
                "temperature", 0.2,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are an airline retail BI analyst for an IBS-style Offer-Order-Settle-Deliver platform. Be concise, numeric, and action-oriented."),
                        Map.of("role", "user", "content",
                                "Context:\n" + context + "\n\nQuestion: " + question)
                )
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);
        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class);
        Map<String, Object> resp = response.getBody();
        if (resp == null) throw new IllegalStateException("Empty Groq response");
        List<Map<String, Object>> choices = (List<Map<String, Object>>) resp.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return message.get("content").toString();
    }
}
