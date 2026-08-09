package com.ibs.airbook.analytics;

import com.ibs.airbook.order.Order;
import com.ibs.airbook.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;

    public record KpiSnapshot(
            long totalOrders,
            long settledOrders,
            long checkedInOrders,
            BigDecimal grossMerchandiseValue,
            BigDecimal averageOrderValue,
            double settlementRate,
            double checkInRate,
            double ancillaryAttachRate
    ) {}

    public record TimeSeriesPoint(String date, long orders, BigDecimal revenue) {}
    public record RouteRevenue(String routeKey, long bookings, BigDecimal revenue) {}
    public record StatusFunnel(String stage, long count) {}

    public KpiSnapshot kpis() {
        List<Order> all = orderRepository.findAll();
        long total = all.size();
        long settled = all.stream().filter(o -> o.getStatus() == Order.OrderStatus.SETTLED
                || o.getStatus() == Order.OrderStatus.CHECKED_IN).count();
        long checkedIn = all.stream().filter(o -> o.getStatus() == Order.OrderStatus.CHECKED_IN).count();
        BigDecimal gmv = all.stream()
                .filter(o -> o.getStatus() != Order.OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal aov = total == 0 ? BigDecimal.ZERO
                : gmv.divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP);
        double settleRate = total == 0 ? 0 : (settled * 100.0) / total;
        double checkRate = settled == 0 ? 0 : (checkedIn * 100.0) / settled;
        double attach = total == 0 ? 0 : all.stream()
                .filter(o -> o.getAncillaryCodes() != null && !o.getAncillaryCodes().isBlank())
                .count() * 100.0 / total;

        return new KpiSnapshot(total, settled, checkedIn, gmv, aov,
                round(settleRate), round(checkRate), round(attach));
    }

    public List<TimeSeriesPoint> revenueTrend(int days) {
        LocalDateTime from = LocalDate.now().minusDays(days - 1L).atStartOfDay();
        Map<String, List<Order>> byDay = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt() != null && !o.getCreatedAt().isBefore(from))
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate().toString()));

        List<TimeSeriesPoint> points = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            String day = LocalDate.now().minusDays(i).toString();
            List<Order> dayOrders = byDay.getOrDefault(day, List.of());
            BigDecimal rev = dayOrders.stream().map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            points.add(new TimeSeriesPoint(day, dayOrders.size(), rev));
        }
        return points;
    }

    public List<RouteRevenue> topRoutes(int limit) {
        // routeId only on order — approximate via booking volume
        Map<Long, List<Order>> byRoute = orderRepository.findAll().stream()
                .collect(Collectors.groupingBy(Order::getRouteId));

        return byRoute.entrySet().stream()
                .map(e -> {
                    BigDecimal rev = e.getValue().stream().map(Order::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new RouteRevenue("ROUTE-" + e.getKey(), e.getValue().size(), rev);
                })
                .sorted(Comparator.comparing(RouteRevenue::revenue).reversed())
                .limit(limit)
                .toList();
    }

    public List<StatusFunnel> oosdFunnel() {
        List<Order> all = orderRepository.findAll();
        long offerTouches = Math.max(all.size() * 4L, all.size()); // proxy for searches vs books
        long ordered = all.size();
        long settled = all.stream().filter(o -> o.getStatus() == Order.OrderStatus.SETTLED
                || o.getStatus() == Order.OrderStatus.CHECKED_IN).count();
        long delivered = all.stream().filter(o -> o.getStatus() == Order.OrderStatus.CHECKED_IN).count();
        return List.of(
                new StatusFunnel("OFFER", offerTouches),
                new StatusFunnel("ORDER", ordered),
                new StatusFunnel("SETTLE", settled),
                new StatusFunnel("DELIVER", delivered)
        );
    }

    private double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
