package com.logistic.controller;

import com.logistic.dto.order.AssignmentRequest;
import com.logistic.dto.order.AssignmentResponse;
import com.logistic.services.TripAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@Tag(name = "Dispatch Assignment", description = "Endpoints for Order-to-Trip/Driver Assignments")
public class TripAssignmentController {

    private final TripAssignmentService assignmentService;

    @PostMapping
    @Operation(summary = "Create trip assignment")
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(request));
    }

    @PostMapping("/auto-assign")
    @Operation(summary = "Auto-assign all pending orders at a hub")
    public ResponseEntity<java.util.List<AssignmentResponse>> autoAssignPendingOrders(
            @RequestParam(required = false) Long hubId
    ) {
        return ResponseEntity.ok(assignmentService.autoAssignPendingOrders(hubId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get assignment by trip ID")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @GetMapping("/{id}/previous")
    @Operation(summary = "Get previous assignment record")
    public ResponseEntity<AssignmentResponse> getPreviousAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getPreviousAssignment(id));
    }

    @GetMapping("/{id}/next")
    @Operation(summary = "Get next assignment record")
    public ResponseEntity<AssignmentResponse> getNextAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getNextAssignment(id));
    }

    @GetMapping
    @Operation(summary = "List assignments with pagination")
    public ResponseEntity<Page<AssignmentResponse>> listAssignments(
            @RequestParam(required = false) Long hubId,
            @RequestParam(required = false) Long driverId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(assignmentService.listAssignments(hubId, driverId, pageable));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update trip status (e.g., IN_TRANSIT, COMPLETED)")
    public ResponseEntity<AssignmentResponse> updateTripStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks
    ) {
        return ResponseEntity.ok(assignmentService.updateTripStatus(id, status, remarks));
    }

    @PatchMapping("/{tripId}/stops/{stopId}/status")
    @Operation(summary = "Update trip stop delivery status (e.g., COMPLETED, FAILED)")
    public ResponseEntity<AssignmentResponse> updateStopStatus(
            @PathVariable Long tripId,
            @PathVariable Long stopId,
            @RequestParam String status,
            @RequestParam(required = false) String remarks
    ) {
        return ResponseEntity.ok(assignmentService.updateStopStatus(tripId, stopId, status, remarks));
    }

    @GetMapping("/driver/{driverId}/today")
    @Operation(summary = "Get today's assigned trips for a driver")
    public ResponseEntity<java.util.List<AssignmentResponse>> getDriverTodayAssignments(@PathVariable Long driverId) {
        return ResponseEntity.ok(assignmentService.getDriverAssignments(driverId));
    }
}
