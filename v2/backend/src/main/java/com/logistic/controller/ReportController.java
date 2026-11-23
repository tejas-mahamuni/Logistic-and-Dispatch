package com.logistic.controller;

import com.logistic.services.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Operational Reports", description = "Endpoints querying database for pipelines, delays, driver performance, and fleet utilization")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/pipeline")
    @Operation(summary = "Order Pipeline counts grouped by hub and status")
    public ResponseEntity<List<Map<String, Object>>> getOrderPipelineReport(@RequestParam(required = false) Long hubId) {
        return ResponseEntity.ok(reportService.getOrderPipelineReport(hubId));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Overdue orders past promised date")
    public ResponseEntity<List<Map<String, Object>>> getOverdueOrdersReport(@RequestParam(required = false) Long hubId) {
        return ResponseEntity.ok(reportService.getOverdueOrdersReport(hubId));
    }

    @GetMapping("/driver-performance")
    @Operation(summary = "Daily driver delivery performance and success rates")
    public ResponseEntity<List<Map<String, Object>>> getDriverPerformanceReport(@RequestParam(required = false) Long hubId) {
        return ResponseEntity.ok(reportService.getDriverPerformanceReport(hubId));
    }

    @GetMapping("/vehicle-utilization")
    @Operation(summary = "Daily vehicle capacity utilization and distance covered")
    public ResponseEntity<List<Map<String, Object>>> getVehicleUtilizationReport(@RequestParam(required = false) Long hubId) {
        return ResponseEntity.ok(reportService.getVehicleUtilizationReport(hubId));
    }
}
