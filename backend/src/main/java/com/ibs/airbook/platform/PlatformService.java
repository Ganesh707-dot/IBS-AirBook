package com.ibs.airbook.platform;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Unified travel commerce catalog: passenger retail, hospitality, cruise,
 * cargo intelligence, loyalty, and AI-assisted tourist services.
 */
@Service
@RequiredArgsConstructor
public class PlatformService {

    private final PlatformReservationRepository reservationRepository;
    private static final AtomicLong REF_SEQ = new AtomicLong(1000);

    public List<SolutionDto> solutions() {
        return List.of(
                sol("PASSENGER", "Passenger Retail", "PASSENGER",
                        "Offer, order, settle, and deliver across NDC-ready retail channels.",
                        "/search", "pi-send", new String[]{"Offer", "Order", "Settle", "Deliver"}),
                sol("CONCIERGE", "AI Travel Concierge", "AI",
                        "Agentic assistance for personalization, disruptions, and destination guidance.",
                        "/concierge", "pi-sparkles", new String[]{"Personalization", "Disruption", "Insights"}),
                sol("HOSPITALITY", "Hospitality Distribution", "HOSPITALITY",
                        "Luxury hotel inventory with packages and flight-to-stay cross-sell.",
                        "/stays", "pi-building", new String[]{"Hotels", "Packages", "Upsell"}),
                sol("CRUISE", "Cruise & Tours", "CRUISE",
                        "Shore-to-ship itineraries with onboard services and excursion retail.",
                        "/cruise", "pi-compass", new String[]{"Itineraries", "Excursions", "Onboard"}),
                sol("CARGO", "Cargo Intelligence", "CARGO",
                        "Lane capacity, commodity mix, and collaboration across the cargo chain.",
                        "/cargo", "pi-box", new String[]{"Lanes", "Capacity", "e-AWB"}),
                sol("LOYALTY", "Loyalty Platform", "LOYALTY",
                        "Tiered rewards and partner offers that drive engagement revenue.",
                        "/loyalty", "pi-star", new String[]{"Tiers", "Partners", "Offers"}),
                sol("OPS", "Operations Center", "OPS",
                        "Live situational awareness for network and disruption management.",
                        "/tracker", "pi-sitemap", new String[]{"Live map", "Demand", "Recovery"}),
                sol("ANALYTICS", "Retail Intelligence", "ANALYTICS",
                        "GMV, funnel analytics, demand forecast, and natural-language analyst.",
                        "/bi", "pi-chart-line", new String[]{"KPIs", "Forecast", "Ask AI"})
        );
    }

    public List<StayDto> stays() {
        return List.of(
                stay("STAY-DXB-BURJ", "Burj Vista Residences", "Dubai", "UAE", "ULTRA_LUXURY",
                        5, 42000, "Skyline suites with private club lounge and airport transfer.",
                        new String[]{"Spa", "Pool", "Club lounge", "Airport transfer"}, "DXB"),
                stay("STAY-SIN-MARINA", "Marina Bay Heritage", "Singapore", "Singapore", "LUXURY",
                        5, 28500, "Waterfront luxury with late checkout and concierge dining.",
                        new String[]{"Infinity pool", "Michelin dining", "Butler"}, "SIN"),
                stay("STAY-MLE-OVER", "Overwater Sanctuary", "Malé Atoll", "Maldives", "ULTRA_LUXURY",
                        5, 65000, "Overwater villas with seaplane connect from regional hubs.",
                        new String[]{"Overwater villa", "Dive center", "All-inclusive"}, "MLE"),
                stay("STAY-CDG-RIVE", "Rive Gauche Maison", "Paris", "France", "PREMIUM",
                        4, 18900, "Boutique stay near CDG with lounge access and city shuttle.",
                        new String[]{"Boutique", "City shuttle", "Breakfast"}, "CDG"),
                stay("STAY-BOM-TAJ", "Harbour Crown Hotel", "Mumbai", "India", "LUXURY",
                        5, 22000, "Harbour-facing rooms with loyalty points boost for AirBook members.",
                        new String[]{"Harbour view", "Loyalty boost", "Spa"}, "BOM"),
                stay("STAY-LHR-MAY", "Mayfair Residence Club", "London", "UK", "ULTRA_LUXURY",
                        5, 38000, "Mayfair apartments with Heathrow chauffeur and afternoon tea.",
                        new String[]{"Chauffeur", "Afternoon tea", "Apartment suite"}, "LHR"),
                stay("STAY-BKK-RIV", "Chao Phraya Riverside", "Bangkok", "Thailand", "PREMIUM",
                        4, 12500, "River suites with tuk-tuk desk and night market packages.",
                        new String[]{"River view", "Night market tour", "Rooftop"}, "BKK"),
                stay("STAY-SYD-CIR", "Circular Quay Grand", "Sydney", "Australia", "LUXURY",
                        5, 31000, "Opera House views with cruise terminal walkway access.",
                        new String[]{"Opera views", "Cruise connect", "Wine bar"}, "SYD")
        );
    }

    public List<CruiseDto> cruises() {
        return List.of(
                cruise("CR-EMIRATES-GULF", "Arabian Gulf Explorer", "MSC Virtuosa",
                        "Dubai", "Muscat · Bahrain · Abu Dhabi · Dubai", 7, 89000, "LUXURY",
                        new String[]{"Premium drinks", "Shore excursions", "Specialty dining"},
                        "Winter sun gulf circuit with SoftBrand retail onboard."),
                cruise("CR-MED-JEWEL", "Mediterranean Jewel", "Celestyal Journey",
                        "Athens", "Santorini · Mykonos · Ephesus · Athens", 5, 72000, "PREMIUM",
                        new String[]{"Island hopping", "Archaeology guides", "Family clubs"},
                        "Classic Aegean with personalized shore-to-ship packages."),
                cruise("CR-ASIA-DRAGON", "Dragon Seas Discovery", "Royal Odyssey",
                        "Singapore", "Phuket · Penang · Langkawi · Singapore", 6, 68000, "PREMIUM",
                        new String[]{"Spa credit", "Kids club", "Night bazaar tours"},
                        "Southeast Asia fly-cruise with AirBook soft connect."),
                cruise("CR-NORDIC-LIGHT", "Northern Lights Voyage", "Aurora Line",
                        "Bergen", "Tromsø · Alta · Bergen", 8, 125000, "ULTRA_LUXURY",
                        new String[]{"Observation lounge", "Photo workshop", "Expedition gear"},
                        "Expedition-style luxury for winter aurora hunting."),
                cruise("CR-CARIB-PEARL", "Caribbean Pearl", "Ocean Majesty",
                        "Miami", "Nassau · St. Thomas · Miami", 5, 55000, "PREMIUM",
                        new String[]{"Private beach day", "Rum tasting", "Casino"},
                        "Short-haul Caribbean with loyalty multiplier weekends."),
                cruise("CR-IND-OCEAN", "Indian Ocean Atolls", "Pearl of Arabia",
                        "Male", "Ari Atoll · Baa Atoll · Male", 4, 98000, "ULTRA_LUXURY",
                        new String[]{"Snorkel safari", "Overwater spa", "Private dining"},
                        "Atoll hopping paired with seaplane hotel packages.")
        );
    }

    public List<CargoLaneDto> cargoLanes() {
        return List.of(
                cargo("COK-DXB", "Kochi → Dubai", "PERISHABLES", 92, 18, "High mango / seafood season capacity"),
                cargo("BOM-LHR", "Mumbai → London", "PHARMA", 88, 12, "Cool-chain priority ULDs"),
                cargo("DEL-FRA", "Delhi → Frankfurt", "GENERAL", 76, 24, "General cargo with e-AWB"),
                cargo("SIN-SYD", "Singapore → Sydney", "EXPRESS", 95, 8, "Express freighter bank"),
                cargo("DXB-JFK", "Dubai → New York", "VALUABLES", 84, 14, "High-value secure lane"),
                cargo("BLR-SIN", "Bengaluru → Singapore", "TECH", 90, 10, "Electronics & components")
        );
    }

    public List<LoyaltyTierDto> loyaltyTiers() {
        return List.of(
                tier("PEARL", "Pearl", 0, 1.0, "Base earn on flights, stays, and cruises"),
                tier("SAPPHIRE", "Sapphire", 25000, 1.25, "Priority bag + hotel late checkout"),
                tier("RUBY", "Ruby", 60000, 1.5, "Lounge guest pass + cruise onboard credit"),
                tier("DIAMOND", "Diamond", 120000, 2.0, "Chauffeur, suite upgrades, concierge desk")
        );
    }

    public List<LoyaltyPartnerDto> loyaltyPartners() {
        return List.of(
                partner("iStay Hotels", "HospitalITY", "2x points on ultra-luxury stays"),
                partner("iTravel Cruise", "CRUISE", "Onboard credit from 15k points"),
                partner("City Experiences", "TOURS", "Shore excursion unlocks"),
                partner("AirBook Retail", "AIR", "Ancillary vouchers from tier benefits")
        );
    }

    public ConciergeResponse askConcierge(String question, String localeHint) {
        String q = question == null ? "" : question.toLowerCase(Locale.ROOT);
        String answer;
        String mode = "LOCAL_NAVIQ_CONCIERGE";
        List<String> actions;

        if (q.contains("hotel") || q.contains("stay") || q.contains("resort")) {
            answer = "For a luxury layover, pair DXB or SIN hubs with ultra-luxury hospitality inventory — skyline suites and marina properties score highest on loyalty boost and transfer inclusion.";
            actions = List.of("Browse hotels", "Compare DXB vs SIN stays", "Apply tier late checkout");
        } else if (q.contains("cruise") || q.contains("ship") || q.contains("shore")) {
            answer = "Cruise retail recommends Arabian Gulf Explorer for winter sun (7N) or Mediterranean Jewel for culture-heavy shore days. Both support shore-to-ship packages and onboard dining upsell.";
            actions = List.of("Browse cruises", "Add shore excursion pack", "Check loyalty onboard credit");
        } else if (q.contains("disrupt") || q.contains("delay") || q.contains("cancel") || q.contains("missed")) {
            answer = "Disruption playbook: 1) Protect onward hotel/cruise with flexible rate, 2) Rebook via Offer search on alternate OD, 3) Use concierge for lounge + transfer coordination. Top-tier members get chauffeur re-accommodation priority.";
            actions = List.of("Search alternate flights", "Hold hotel flexibly", "Open live tracker");
        } else if (q.contains("family") || q.contains("kids") || q.contains("honeymoon") || q.contains("romantic")) {
            answer = "For honeymoon: overwater sanctuary + Indian Ocean atolls cruise. For families: Southeast Asia discovery cruise with kids club and riverside Bangkok as pre-cruise hotel.";
            actions = List.of("View Maldives stay", "View Asia cruise", "Build package");
        } else if (q.contains("cargo") || q.contains("freight") || q.contains("uld")) {
            answer = "Cargo lanes COK–DXB (perishables) and BOM–LHR (pharma cool-chain) are hottest this week. Capacity scores are live collaboration signals across retail and logistics.";
            actions = List.of("Open cargo lanes", "View pharma cool-chain");
        } else if (q.contains("point") || q.contains("loyalty") || q.contains("tier") || q.contains("diamond")) {
            answer = "Loyalty tiers: Pearl → Sapphire (25k) → Ruby (60k) → Diamond (120k). Diamond unlocks chauffeur, suite upgrades, and dedicated concierge. Stays and cruises accelerate earn with partner multipliers.";
            actions = List.of("View loyalty tiers", "See partner offers");
        } else {
            answer = "I'm your AI travel concierge — ask about hotels, cruises, disruptions, family trips, loyalty, or cargo. I orchestrate passenger retail with hospitality and cruise packages to optimize revenue and guest experience.";
            actions = List.of("Suggest a 5-day luxury trip", "Hotels near DXB", "Best family cruise");
        }

        return new ConciergeResponse(answer, mode, actions, Map.of(
                "localeHint", localeHint == null ? "en" : localeHint,
                "domains", List.of("PASSENGER", "HOSPITALITY", "CRUISE", "LOYALTY", "CARGO")
        ));
    }

    @Transactional
    public ReservationDto bookStay(String stayId) {
        StayDto stay = stays().stream()
                .filter(s -> s.id().equals(stayId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Stay not found: " + stayId));
        return saveReservation(PlatformReservation.ProductType.STAY, stay.id(), stay.name(), stay.priceFrom(), stay.currency());
    }

    @Transactional
    public ReservationDto bookCruise(String cruiseId) {
        CruiseDto cruise = cruises().stream()
                .filter(c -> c.id().equals(cruiseId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Cruise not found: " + cruiseId));
        return saveReservation(PlatformReservation.ProductType.CRUISE, cruise.id(), cruise.name(), cruise.priceFrom(), cruise.currency());
    }

    public List<ReservationDto> reservationsForCurrentUser() {
        return reservationRepository.findByCustomerEmailOrderByCreatedAtDesc(currentUserEmail())
                .stream().map(ReservationDto::from).toList();
    }

    private ReservationDto saveReservation(PlatformReservation.ProductType type, String productId,
                                           String productName, BigDecimal amount, String currency) {
        String prefix = type == PlatformReservation.ProductType.STAY ? "HTL" : "CRZ";
        String ref = prefix + String.format("%08d", REF_SEQ.incrementAndGet());
        PlatformReservation saved = reservationRepository.save(PlatformReservation.builder()
                .reference(ref)
                .customerEmail(currentUserEmail())
                .productType(type)
                .productId(productId)
                .productName(productName)
                .amount(amount)
                .currency(currency)
                .status(PlatformReservation.ReservationStatus.CONFIRMED)
                .createdAt(LocalDateTime.now())
                .build());
        return ReservationDto.from(saved);
    }

    private String currentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private SolutionDto sol(String code, String name, String domain, String blurb, String route, String icon, String[] pillars) {
        return new SolutionDto(code, name, domain, blurb, route, icon, List.of(pillars));
    }

    private StayDto stay(String id, String name, String city, String country, String tier, int stars,
                         double price, String blurb, String[] amenities, String hub) {
        return new StayDto(id, name, city, country, tier, stars, BigDecimal.valueOf(price), "INR", blurb,
                List.of(amenities), hub);
    }

    private CruiseDto cruise(String id, String name, String ship, String embark, String ports, int nights,
                             double price, String tier, String[] perks, String blurb) {
        return new CruiseDto(id, name, ship, embark, ports, nights, BigDecimal.valueOf(price), "INR", tier,
                List.of(perks), blurb);
    }

    private CargoLaneDto cargo(String code, String lane, String commodity, int capacityScore, int etdHours, String note) {
        return new CargoLaneDto(code, lane, commodity, capacityScore, etdHours, note);
    }

    private LoyaltyTierDto tier(String code, String name, int threshold, double multiplier, String perk) {
        return new LoyaltyTierDto(code, name, threshold, multiplier, perk);
    }

    private LoyaltyPartnerDto partner(String name, String category, String offer) {
        return new LoyaltyPartnerDto(name, category, offer);
    }

    public record SolutionDto(String code, String name, String domain, String blurb, String route,
                              String icon, List<String> pillars) {}
    public record StayDto(String id, String name, String city, String country, String tier, int stars,
                          BigDecimal priceFrom, String currency, String blurb, List<String> amenities, String hubAirport) {}
    public record CruiseDto(String id, String name, String ship, String embarkPort, String portsOfCall,
                            int nights, BigDecimal priceFrom, String currency, String tier,
                            List<String> perks, String blurb) {}
    public record CargoLaneDto(String code, String lane, String commodity, int capacityScore,
                               int etdHours, String note) {}
    public record LoyaltyTierDto(String code, String name, int pointsThreshold, double earnMultiplier, String perk) {}
    public record LoyaltyPartnerDto(String name, String category, String offer) {}
    public record ConciergeResponse(String answer, String mode, List<String> suggestedActions, Map<String, Object> context) {}
    public record ReservationDto(
            String reference, String productType, String productId, String productName,
            BigDecimal amount, String currency, String status, LocalDateTime createdAt
    ) {
        static ReservationDto from(PlatformReservation r) {
            return new ReservationDto(
                    r.getReference(),
                    r.getProductType().name(),
                    r.getProductId(),
                    r.getProductName(),
                    r.getAmount(),
                    r.getCurrency(),
                    r.getStatus().name(),
                    r.getCreatedAt()
            );
        }
    }
}
