package com.logistic.services;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrderPipelineReport(Long hubId) {
        String sql = """
            SELECT 
                o.hub_id, 
                COALESCE(h.name, CONCAT('Hub #', o.hub_id)) AS hub_name, 
                o.current_status, 
                COUNT(o.id) AS order_count, 
                COALESCE(SUM(o.order_amount), 0.00) AS total_amount,
                COALESCE(SUM(o.weight_kg), 0.00) AS total_weight_kg
            FROM orders o
            LEFT JOIN hubs h ON o.hub_id = h.id
            WHERE (:hubId IS NULL OR o.hub_id = :hubId)
            GROUP BY o.hub_id, h.name, o.current_status
            ORDER BY o.hub_id, o.current_status
        """;
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("hubId", (hubId != null && hubId > 0) ? hubId : null);
        return jdbcTemplate.queryForList(sql, params);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOverdueOrdersReport(Long hubId) {
        String sql = """
            SELECT 
                o.id, 
                o.tracking_no, 
                o.hub_id, 
                COALESCE(h.name, CONCAT('Hub #', o.hub_id)) AS hub_name, 
                c.full_name AS customer_name, 
                c.phone AS customer_phone, 
                o.destination_pincode, 
                o.current_status, 
                o.order_amount, 
                o.payment_mode,
                o.promised_date, 
                DATEDIFF(CURRENT_DATE, o.promised_date) AS days_overdue
            FROM orders o
            LEFT JOIN hubs h ON o.hub_id = h.id
            LEFT JOIN customers c ON o.customer_id = c.id
            WHERE o.current_status != 'DELIVERED' 
              AND o.promised_date < CURRENT_DATE
              AND (:hubId IS NULL OR o.hub_id = :hubId)
            ORDER BY days_overdue DESC, o.id DESC
        """;
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("hubId", (hubId != null && hubId > 0) ? hubId : null);
        return jdbcTemplate.queryForList(sql, params);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDriverPerformanceReport(Long hubId) {
        String sql = """
            SELECT 
                d.id AS driver_id, 
                d.driver_name, 
                d.phone AS driver_phone,
                d.hub_id, 
                COALESCE(h.name, CONCAT('Hub #', d.hub_id)) AS hub_name, 
                COUNT(da.id) AS total_assigned, 
                SUM(CASE WHEN del.status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_count, 
                SUM(CASE WHEN del.status = 'DELAYED' THEN 1 ELSE 0 END) AS delayed_count, 
                COALESCE(SUM(del.amount_collected), 0.00) AS total_cod_collected
            FROM drivers d
            LEFT JOIN hubs h ON d.hub_id = h.id
            LEFT JOIN dispatch_assignments da ON d.id = da.driver_id
            LEFT JOIN deliveries del ON da.id = del.assignment_id
            WHERE (:hubId IS NULL OR d.hub_id = :hubId)
            GROUP BY d.id, d.driver_name, d.phone, d.hub_id, h.name
            ORDER BY delivered_count DESC, d.driver_name ASC
        """;
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("hubId", (hubId != null && hubId > 0) ? hubId : null);
        return jdbcTemplate.queryForList(sql, params);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getVehicleUtilizationReport(Long hubId) {
        String sql = """
            SELECT 
                v.id AS vehicle_id, 
                v.registration_no, 
                v.vehicle_type, 
                v.capacity_kg, 
                v.hub_id, 
                COALESCE(h.name, CONCAT('Hub #', v.hub_id)) AS hub_name, 
                COUNT(da.id) AS total_trips, 
                COALESCE(SUM(o.weight_kg), 0.00) AS total_weight_carried,
                ROUND(CASE WHEN v.capacity_kg > 0 THEN (COALESCE(SUM(o.weight_kg), 0.00) / v.capacity_kg) * 100 ELSE 0 END, 2) AS utilization_pct
            FROM vehicles v
            LEFT JOIN hubs h ON v.hub_id = h.id
            LEFT JOIN dispatch_assignments da ON v.id = da.vehicle_id
            LEFT JOIN orders o ON da.order_id = o.id
            WHERE (:hubId IS NULL OR v.hub_id = :hubId)
            GROUP BY v.id, v.registration_no, v.vehicle_type, v.capacity_kg, v.hub_id, h.name
            ORDER BY total_trips DESC, v.registration_no ASC
        """;
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("hubId", (hubId != null && hubId > 0) ? hubId : null);
        return jdbcTemplate.queryForList(sql, params);
    }
}
