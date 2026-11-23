package com.logistic.controller;

import com.logistic.dto.order.OrderRequest;
import com.logistic.dto.order.OrderResponse;
import com.logistic.security.JwtPrincipal;
import com.logistic.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Endpoints for Order Intake, Search, and Dispatch Entry Navigation")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Intake new order (Manual or API)")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Batch intake multiple orders (CSV / Batch upload)")
    public ResponseEntity<List<OrderResponse>> createBulkOrders(@Valid @RequestBody List<OrderRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createBulkOrders(requests));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get pending unassigned orders for a hub")
    public ResponseEntity<List<OrderResponse>> getPendingOrders(@RequestParam(required = false) Long hubId) {
        return ResponseEntity.ok(orderService.getPendingUnassignedOrders(hubId));
    }

    @GetMapping("/warehouse-queue")
    @Operation(summary = "Get orders currently at the Central Warehouse awaiting trunk dispatch")
    public ResponseEntity<List<OrderResponse>> getWarehouseQueue(@RequestParam(required = false) Long hubId) {
        return ResponseEntity.ok(orderService.getWarehouseQueue(hubId));
    }

    @PostMapping("/trunk-dispatch")
    @Operation(summary = "Ship orders from Central Warehouse to a Local Hub via truck")
    public ResponseEntity<List<OrderResponse>> dispatchTrunkRoute(
            @RequestBody List<Long> orderIds,
            @RequestParam(required = false) Long hubId,
            @RequestParam(required = false) String remarks
    ) {
        return ResponseEntity.ok(orderService.dispatchTrunkRoute(orderIds, hubId, remarks));
    }

    @PostMapping("/trunk-dispatch/auto-ship-all")
    @Operation(summary = "Auto-ship all queued parcels from Central Warehouse to their respective local delivery hubs")
    public ResponseEntity<List<OrderResponse>> autoShipAllWarehouseOrders() {
        return ResponseEntity.ok(orderService.autoShipAllWarehouseOrders());
    }

    @PostMapping("/receive-at-hub")
    @Operation(summary = "Receive trunk-shipped orders at local hub (status becomes PENDING)")
    public ResponseEntity<List<OrderResponse>> receiveAtHub(
            @RequestBody List<Long> orderIds,
            @RequestParam(required = false) Long hubId
    ) {
        return ResponseEntity.ok(orderService.receiveAtHub(orderIds, hubId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find order by ID")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/track/{trackingNo}")
    @Operation(summary = "Track shipment by tracking number")
    public ResponseEntity<OrderResponse> getOrderByTrackingNo(@PathVariable String trackingNo) {
        return ResponseEntity.ok(orderService.getOrderByTrackingNo(trackingNo));
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get consignments for currently logged-in customer")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal JwtPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(orderService.getOrdersByCustomer(principal.getUserId()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/{id}/previous")
    @Operation(summary = "Get previous order record")
    public ResponseEntity<OrderResponse> getPreviousOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getPreviousOrder(id));
    }

    @GetMapping("/{id}/next")
    @Operation(summary = "Get next order record")
    public ResponseEntity<OrderResponse> getNextOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getNextOrder(id));
    }

    @GetMapping
    @Operation(summary = "List orders with pagination")
    public ResponseEntity<Page<OrderResponse>> listOrders(
            @RequestParam(required = false) Long hubId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(orderService.listOrders(hubId, pageable));
    }
}
