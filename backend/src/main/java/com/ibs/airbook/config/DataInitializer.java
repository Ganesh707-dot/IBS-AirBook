package com.ibs.airbook.config;

import com.ibs.airbook.auth.User;
import com.ibs.airbook.auth.UserRepository;
import com.ibs.airbook.catalog.Airport;
import com.ibs.airbook.catalog.AirportRepository;
import com.ibs.airbook.catalog.Ancillary;
import com.ibs.airbook.catalog.AncillaryRepository;
import com.ibs.airbook.offer.OfferService;
import com.ibs.airbook.offer.Route;
import com.ibs.airbook.offer.RouteRepository;
import com.ibs.airbook.order.Order;
import com.ibs.airbook.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AirportRepository airportRepository;
    private final AncillaryRepository ancillaryRepository;
    private final RouteRepository routeRepository;
    private final OrderRepository orderRepository;
    private final OfferService offerService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedAirports();
        seedAncillaries();
        warmPopularMarkets();
        simulateRetailHistory();
        log.info("AirBook enterprise data plane ready — airports={}, routes={}, orders={}",
                airportRepository.count(), routeRepository.count(), orderRepository.count());
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;
        userRepository.save(User.builder()
                .email("admin@airbook.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("Retail Ops Admin")
                .role(User.Role.ADMIN)
                .build());
        userRepository.save(User.builder()
                .email("customer@airbook.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Ganesh V")
                .role(User.Role.CUSTOMER)
                .build());
        userRepository.save(User.builder()
                .email("analyst@airbook.com")
                .password(passwordEncoder.encode("analyst123"))
                .fullName("BI Analyst")
                .role(User.Role.ADMIN)
                .build());
    }

    private void seedAirports() {
        if (airportRepository.count() > 0) return;
        airportRepository.saveAll(List.of(
                ap("COK", "Cochin International", "Kochi", "India", 10.1520, 76.4019, "Asia/Kolkata"),
                ap("BLR", "Kempegowda International", "Bengaluru", "India", 13.1986, 77.7066, "Asia/Kolkata"),
                ap("BOM", "Chhatrapati Shivaji Maharaj", "Mumbai", "India", 19.0896, 72.8656, "Asia/Kolkata"),
                ap("DEL", "Indira Gandhi International", "Delhi", "India", 28.5562, 77.1000, "Asia/Kolkata"),
                ap("MAA", "Chennai International", "Chennai", "India", 12.9941, 80.1709, "Asia/Kolkata"),
                ap("HYD", "Rajiv Gandhi International", "Hyderabad", "India", 17.2403, 78.4294, "Asia/Kolkata"),
                ap("CCU", "Netaji Subhas Chandra Bose", "Kolkata", "India", 22.6547, 88.4467, "Asia/Kolkata"),
                ap("GOI", "Manohar International", "Goa", "India", 15.3808, 73.8314, "Asia/Kolkata"),
                ap("AMD", "Sardar Vallabhbhai Patel", "Ahmedabad", "India", 23.0772, 72.6347, "Asia/Kolkata"),
                ap("PNQ", "Pune Airport", "Pune", "India", 18.5822, 73.9197, "Asia/Kolkata"),
                ap("DXB", "Dubai International", "Dubai", "UAE", 25.2532, 55.3657, "Asia/Dubai"),
                ap("AUH", "Abu Dhabi International", "Abu Dhabi", "UAE", 24.4330, 54.6511, "Asia/Dubai"),
                ap("DOH", "Hamad International", "Doha", "Qatar", 25.2731, 51.6081, "Asia/Qatar"),
                ap("BAH", "Bahrain International", "Manama", "Bahrain", 26.2708, 50.6336, "Asia/Bahrain"),
                ap("RUH", "King Khalid International", "Riyadh", "Saudi Arabia", 24.9576, 46.6988, "Asia/Riyadh"),
                ap("JED", "King Abdulaziz International", "Jeddah", "Saudi Arabia", 21.6796, 39.1565, "Asia/Riyadh"),
                ap("MCT", "Muscat International", "Muscat", "Oman", 23.5933, 58.2844, "Asia/Muscat"),
                ap("SIN", "Singapore Changi", "Singapore", "Singapore", 1.3644, 103.9915, "Asia/Singapore"),
                ap("KUL", "Kuala Lumpur International", "Kuala Lumpur", "Malaysia", 2.7456, 101.7072, "Asia/Kuala_Lumpur"),
                ap("BKK", "Suvarnabhumi", "Bangkok", "Thailand", 13.6900, 100.7501, "Asia/Bangkok"),
                ap("HKG", "Hong Kong International", "Hong Kong", "China", 22.3080, 113.9185, "Asia/Hong_Kong"),
                ap("NRT", "Narita International", "Tokyo", "Japan", 35.7720, 140.3929, "Asia/Tokyo"),
                ap("LHR", "Heathrow", "London", "United Kingdom", 51.4700, -0.4543, "Europe/London"),
                ap("CDG", "Charles de Gaulle", "Paris", "France", 49.0097, 2.5479, "Europe/Paris"),
                ap("FRA", "Frankfurt am Main", "Frankfurt", "Germany", 50.0379, 8.5622, "Europe/Berlin"),
                ap("AMS", "Schiphol", "Amsterdam", "Netherlands", 52.3105, 4.7683, "Europe/Amsterdam"),
                ap("ZRH", "Zurich Airport", "Zurich", "Switzerland", 47.4582, 8.5555, "Europe/Zurich"),
                ap("MUC", "Munich Airport", "Munich", "Germany", 48.3538, 11.7861, "Europe/Berlin"),
                ap("FCO", "Leonardo da Vinci–Fiumicino", "Rome", "Italy", 41.8003, 12.2389, "Europe/Rome"),
                ap("MAD", "Adolfo Suárez Madrid–Barajas", "Madrid", "Spain", 40.4983, -3.5676, "Europe/Madrid"),
                ap("JFK", "John F. Kennedy International", "New York", "USA", 40.6413, -73.7781, "America/New_York"),
                ap("EWR", "Newark Liberty", "Newark", "USA", 40.6895, -74.1745, "America/New_York"),
                ap("ORD", "O'Hare International", "Chicago", "USA", 41.9742, -87.9073, "America/Chicago"),
                ap("LAX", "Los Angeles International", "Los Angeles", "USA", 33.9425, -118.4081, "America/Los_Angeles"),
                ap("SFO", "San Francisco International", "San Francisco", "USA", 37.6213, -122.3790, "America/Los_Angeles"),
                ap("IAD", "Dulles International", "Washington", "USA", 38.9531, -77.4565, "America/New_York"),
                ap("SYD", "Sydney Kingsford Smith", "Sydney", "Australia", -33.9399, 151.1753, "Australia/Sydney"),
                ap("MEL", "Melbourne Airport", "Melbourne", "Australia", -37.6690, 144.8410, "Australia/Melbourne"),
                ap("CMB", "Bandaranaike International", "Colombo", "Sri Lanka", 7.1808, 79.8841, "Asia/Colombo"),
                ap("KTM", "Tribhuvan International", "Kathmandu", "Nepal", 27.6970, 85.3591, "Asia/Kathmandu")
        ));
    }

    private void seedAncillaries() {
        if (ancillaryRepository.count() > 0) return;
        ancillaryRepository.saveAll(List.of(
                anc("BAG15", "Extra Baggage 15kg", "Additional checked baggage", 2500, "BAGGAGE"),
                anc("BAG30", "Extra Baggage 30kg", "Heavy checked baggage allowance", 4200, "BAGGAGE"),
                anc("MEAL", "In-flight Meal", "Hot meal with beverage", 800, "MEAL"),
                anc("MEAL_VG", "Vegetarian Meal", "Special vegetarian tray", 900, "MEAL"),
                anc("PRIO", "Priority Boarding", "Board before general passengers", 1200, "PRIORITY"),
                anc("SEAT", "Preferred Seat", "Window or aisle seat selection", 600, "SEAT"),
                anc("SEAT_XL", "Extra Legroom", "Exit-row / bulkhead seating", 1800, "SEAT"),
                anc("LOUNGE", "Airport Lounge", "Access to departure lounge", 3500, "LOUNGE"),
                anc("WIFI", "Inflight Wi-Fi", "Streaming-capable connectivity", 1500, "CONNECTIVITY"),
                anc("INS", "Travel Insurance", "Trip disruption cover", 999, "INSURANCE")
        ));
    }

    private void warmPopularMarkets() {
        // Keep startup fast — warm only top corridors
        String[][] markets = {{"COK", "DXB"}, {"BOM", "DXB"}};
        LocalDate base = LocalDate.now().plusDays(5);
        for (String[] m : markets) {
            try {
                offerService.search(m[0], m[1], base);
            } catch (Exception e) {
                log.warn("Market warm-up failed for {}-{}: {}", m[0], m[1], e.getMessage());
            }
        }
    }

    private void simulateRetailHistory() {
        if (orderRepository.count() > 0) return;
        List<Route> routes = routeRepository.findAll();
        if (routes.isEmpty()) return;

        String[] names = {"Asha Nair", "Rahul Menon", "Fatima Ali", "John Mathew", "Priya Shah", "Omar Khan"};
        String[] pays = {"CARD", "UPI", "WALLET"};
        String[] ancOpts = {"", "BAG15", "MEAL", "BAG15,MEAL", "PRIO,SEAT", "LOUNGE", "WIFI,INS"};

        for (int i = 0; i < 48; i++) {
            Route route = routes.get(ThreadLocalRandom.current().nextInt(routes.size()));
            LocalDateTime created = LocalDateTime.now().minusDays(ThreadLocalRandom.current().nextInt(14))
                    .minusHours(ThreadLocalRandom.current().nextInt(20));
            String anc = ancOpts[ThreadLocalRandom.current().nextInt(ancOpts.length)];
            int pax = 1 + ThreadLocalRandom.current().nextInt(3);
            BigDecimal total = route.getBasePrice().multiply(BigDecimal.valueOf(pax));
            if (!anc.isBlank()) {
                total = total.add(BigDecimal.valueOf(1200L * anc.split(",").length * pax));
            }

            Order.OrderStatus status;
            double r = ThreadLocalRandom.current().nextDouble();
            if (r < 0.12) status = Order.OrderStatus.PENDING_PAYMENT;
            else if (r < 0.55) status = Order.OrderStatus.SETTLED;
            else if (r < 0.92) status = Order.OrderStatus.CHECKED_IN;
            else status = Order.OrderStatus.CANCELLED;

            Order.OrderBuilder b = Order.builder()
                    .bookingReference("AB" + String.format("%08d", 10000000 + i))
                    .customerEmail("customer@airbook.com")
                    .routeId(route.getId())
                    .passengerName(names[ThreadLocalRandom.current().nextInt(names.length)])
                    .passengerEmail("customer@airbook.com")
                    .passengers(pax)
                    .totalAmount(total)
                    .ancillaryCodes(anc)
                    .status(status)
                    .createdAt(created);

            if (status == Order.OrderStatus.SETTLED || status == Order.OrderStatus.CHECKED_IN) {
                b.paymentId("PAY-SIM" + i).paymentMethod(pays[ThreadLocalRandom.current().nextInt(pays.length)])
                        .settledAt(created.plusMinutes(3));
            }
            if (status == Order.OrderStatus.CHECKED_IN) {
                b.checkedInAt(created.plusDays(1));
            }
            orderRepository.save(b.build());
        }
    }

    private Airport ap(String iata, String name, String city, String country,
                       double lat, double lon, String tz) {
        return Airport.builder().iata(iata).name(name).city(city).country(country)
                .latitude(lat).longitude(lon).timezone(tz).build();
    }

    private Ancillary anc(String code, String name, String desc, double price, String category) {
        return Ancillary.builder().code(code).name(name).description(desc)
                .price(BigDecimal.valueOf(price)).category(category).build();
    }
}
