package com.ibs.airbook.config;

import com.ibs.airbook.auth.User;
import com.ibs.airbook.auth.UserRepository;
import com.ibs.airbook.catalog.Ancillary;
import com.ibs.airbook.catalog.AncillaryRepository;
import com.ibs.airbook.offer.Route;
import com.ibs.airbook.offer.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RouteRepository routeRepository;
    private final AncillaryRepository ancillaryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .email("admin@airbook.com")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Admin User")
                    .role(User.Role.ADMIN)
                    .build());
            userRepository.save(User.builder()
                    .email("customer@airbook.com")
                    .password(passwordEncoder.encode("customer123"))
                    .fullName("Ganesh V")
                    .role(User.Role.CUSTOMER)
                    .build());
        }

        if (routeRepository.count() == 0) {
            seedRoutes();
        }

        if (ancillaryRepository.count() == 0) {
            seedAncillaries();
        }
    }

    private void seedRoutes() {
        routeRepository.saveAll(java.util.List.of(
                route("COK", "DXB", "AirBook", "AB101", "06:30", "09:15", 195, 18500, "ECONOMY", 120),
                route("COK", "DXB", "AirBook", "AB103", "14:00", "16:45", 195, 24500, "BUSINESS", 24),
                route("COK", "SIN", "AirBook", "AB201", "08:00", "14:30", 390, 22000, "ECONOMY", 180),
                route("COK", "SIN", "AirBook", "AB203", "22:00", "04:30", 390, 32000, "PREMIUM", 48),
                route("BLR", "LHR", "AirBook", "AB501", "03:00", "09:30", 630, 45000, "ECONOMY", 200),
                route("BLR", "LHR", "AirBook", "AB503", "03:00", "09:30", 630, 85000, "BUSINESS", 32),
                route("DEL", "JFK", "AirBook", "AB701", "02:00", "08:30", 900, 52000, "ECONOMY", 250),
                route("BOM", "DXB", "AirBook", "AB301", "10:15", "12:00", 165, 15000, "ECONOMY", 150)
        ));
    }

    private Route route(String origin, String dest, String airline, String flight,
                        String dep, String arr, int duration, double price,
                        String fareFamily, int seats) {
        return Route.builder()
                .origin(origin).destination(dest).airline(airline).flightNumber(flight)
                .departureTime(dep).arrivalTime(arr).durationMinutes(duration)
                .basePrice(BigDecimal.valueOf(price)).fareFamily(fareFamily).availableSeats(seats)
                .build();
    }

    private void seedAncillaries() {
        ancillaryRepository.saveAll(java.util.List.of(
                ancillary("BAG15", "Extra Baggage 15kg", "Additional checked baggage", 2500, "BAGGAGE"),
                ancillary("MEAL", "In-flight Meal", "Hot meal with beverage", 800, "MEAL"),
                ancillary("PRIO", "Priority Boarding", "Board before general passengers", 1200, "PRIORITY"),
                ancillary("SEAT", "Preferred Seat", "Window or aisle seat selection", 600, "SEAT"),
                ancillary("LOUNGE", "Airport Lounge", "Access to departure lounge", 3500, "LOUNGE")
        ));
    }

    private Ancillary ancillary(String code, String name, String desc, double price, String category) {
        return Ancillary.builder()
                .code(code).name(name).description(desc)
                .price(BigDecimal.valueOf(price)).category(category)
                .build();
    }
}
