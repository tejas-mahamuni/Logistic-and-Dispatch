package com.logistic.controller;

import com.logistic.dto.hub.HubRequest;
import com.logistic.dto.hub.HubResponse;
import com.logistic.dto.hub.ZoneRequest;
import com.logistic.entity.ServiceZone;
import com.logistic.services.HubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hubs")
@RequiredArgsConstructor
@Tag(name = "Hub & Geography", description = "Endpoints for Hubs and Service Zones")
public class HubController {

    private final HubService hubService;

    @GetMapping
    @Operation(summary = "List all active hubs")
    public ResponseEntity<List<HubResponse>> getAllHubs() {
        return ResponseEntity.ok(hubService.listAllActive());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get hub by ID")
    public ResponseEntity<HubResponse> getHubById(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new hub (ADMIN only)")
    public ResponseEntity<HubResponse> createHub(@Valid @RequestBody HubRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hubService.create(req));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update hub details (ADMIN only)")
    public ResponseEntity<HubResponse> updateHub(@PathVariable Long id, @Valid @RequestBody HubRequest req) {
        return ResponseEntity.ok(hubService.update(id, req));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update hub status (ADMIN only)")
    public ResponseEntity<HubResponse> setStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(hubService.setStatus(id, status));
    }

    @GetMapping("/{id}/service-zones")
    @Operation(summary = "List service zones (pincodes) served by hub")
    public ResponseEntity<List<ServiceZone>> getServiceZonesByHub(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.getZones(id));
    }

    @PostMapping("/{id}/service-zones")
    @Operation(summary = "Add a service zone / pincode to a hub (ADMIN only)")
    public ResponseEntity<ServiceZone> addServiceZone(@PathVariable Long id, @Valid @RequestBody ZoneRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hubService.addZone(id, req));
    }

    @DeleteMapping("/{id}/service-zones/{zoneId}")
    @Operation(summary = "Remove a service zone from a hub (ADMIN only)")
    public ResponseEntity<Map<String, String>> removeServiceZone(@PathVariable Long id, @PathVariable Long zoneId) {
        hubService.removeZone(id, zoneId);
        return ResponseEntity.ok(Map.of("message", "Service zone removed successfully"));
    }
}
