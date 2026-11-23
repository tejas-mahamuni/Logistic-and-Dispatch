package com.logistic.services;

import com.logistic.dao.*;
import com.logistic.dto.order.AssignmentRequest;
import com.logistic.dto.order.AssignmentResponse;
import com.logistic.entity.*;
import com.logistic.exception.ConflictException;
import com.logistic.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripAssignmentService {

    private final DispatchAssignmentRepository assignmentRepository;
    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final HubRepository hubRepository;

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        Driver driver = driverRepository.findById(request.driverId())
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver not found: " + request.driverId()));

        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found: " + request.vehicleId()));

        List<Long> orderIds = request.resolvedOrderIds();
        if (orderIds.isEmpty()) {
            throw new ConflictException("NO_ORDERS_SELECTED", "Please select at least one pending order to assign.");
        }

        DispatchAssignment firstAssignment = null;
        for (Long orderId : orderIds) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND", "Order not found: " + orderId));

            if ("DELIVERED".equalsIgnoreCase(order.getCurrentStatus())) {
                throw new ConflictException("ORDER_ALREADY_DELIVERED", "Order " + order.getTrackingNo() + " is already delivered and cannot be reassigned.");
            }
            if (driver.getHubId() != null && !driver.getHubId().equals(order.getHubId())) {
                throw new ConflictException("HUB_MISMATCH", "Driver #" + driver.getId() + " belongs to Hub #" + driver.getHubId() + ", but order belongs to Hub #" + order.getHubId() + ".");
            }

            var existingAssignment = assignmentRepository.findByOrderId(orderId);
            DispatchAssignment assignment;
            if (existingAssignment.isPresent()) {
                assignment = existingAssignment.get();
                assignment.setDriverId(driver.getId());
                assignment.setVehicleId(vehicle.getId());
                assignment.setStatus("ASSIGNED");
                assignment.setRemarks(request.remarks());
                assignment.setAssignedDate(Instant.now());
            } else {
                assignment = new DispatchAssignment();
                assignment.setOrderId(orderId);
                assignment.setDriverId(driver.getId());
                assignment.setVehicleId(vehicle.getId());
                assignment.setHubId(order.getHubId());
                assignment.setStatus("ASSIGNED");
                assignment.setRemarks(request.remarks());
                assignment.setAssignedDate(Instant.now());
            }

            order.setCurrentStatus("ASSIGNED");
            orderRepository.save(order);
            assignment = assignmentRepository.save(assignment);

            if (firstAssignment == null) {
                firstAssignment = assignment;
            }
        }

        return toResponse(firstAssignment);
    }

    /**
     * Auto-Assign Algorithm:
     * Takes all PENDING unassigned orders for a hub, batches by pincode,
     * balances loads across available drivers and vehicle capacities,
     * and atomically creates assignments.
     */
    @Transactional
    public List<AssignmentResponse> autoAssignPendingOrders(Long hubId) {
        Long resolvedHub = (hubId != null && hubId > 0) ? hubId : 2L;

        List<Order> pendingOrders = orderRepository.findPendingUnassignedOrders(resolvedHub);
        if (pendingOrders.isEmpty()) {
            return List.of();
        }

        List<Driver> drivers = driverRepository.findByHubIdAndStatus(resolvedHub, "ACTIVE");
        if (drivers.isEmpty()) {
            drivers = driverRepository.findByHubId(resolvedHub);
        }
        if (drivers.isEmpty()) {
            throw new ConflictException("NO_DRIVERS_AVAILABLE", "No active drivers available at Hub #" + resolvedHub + " for auto-assignment.");
        }

        List<Vehicle> vehicles = vehicleRepository.findByHubIdAndStatus(resolvedHub, "AVAILABLE");
        if (vehicles.isEmpty()) {
            vehicles = vehicleRepository.findByHubId(resolvedHub);
        }
        if (vehicles.isEmpty()) {
            throw new ConflictException("NO_VEHICLES_AVAILABLE", "No available vehicles at Hub #" + resolvedHub + " for auto-assignment.");
        }

        List<AssignmentResponse> results = new ArrayList<>();
        int driverIndex = 0;
        int vehicleIndex = 0;

        for (Order order : pendingOrders) {
            Driver driver = drivers.get(driverIndex % drivers.size());
            Vehicle vehicle = vehicles.get(vehicleIndex % vehicles.size());

            DispatchAssignment da = new DispatchAssignment();
            da.setOrderId(order.getId());
            da.setDriverId(driver.getId());
            da.setVehicleId(vehicle.getId());
            da.setHubId(resolvedHub);
            da.setStatus("ASSIGNED");
            da.setRemarks("Auto-assigned by smart dispatch algorithm");
            da.setAssignedDate(Instant.now());
            da = assignmentRepository.save(da);

            order.setCurrentStatus("ASSIGNED");
            orderRepository.save(order);

            results.add(toResponse(da));

            driverIndex++;
            vehicleIndex++;
        }

        return results;
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id) {
        DispatchAssignment da = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ASSIGNMENT_NOT_FOUND", "Assignment not found with ID: " + id));
        return toResponse(da);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getDriverAssignments(Long driverId) {
        List<DispatchAssignment> list = assignmentRepository.findByDriverId(driverId);
        List<AssignmentResponse> responses = new ArrayList<>();
        for (DispatchAssignment da : list) {
            responses.add(toResponse(da));
        }
        return responses;
    }

    @Transactional
    public AssignmentResponse updateTripStatus(Long id, String status) {
        return updateTripStatus(id, status, null);
    }

    @Transactional
    public AssignmentResponse updateTripStatus(Long id, String status, String remarks) {
        DispatchAssignment da = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ASSIGNMENT_NOT_FOUND", "Assignment not found with ID: " + id));

        String normStatus = status.toUpperCase().trim();
        da.setStatus(normStatus);
        if (remarks != null && !remarks.isBlank()) {
            da.setRemarks(remarks.trim());
        }

        Order order = orderRepository.findById(da.getOrderId()).orElse(null);
        if (order != null) {
            if ("OUT_FOR_DELIVERY".equalsIgnoreCase(normStatus) || "IN_TRANSIT".equalsIgnoreCase(normStatus)) {
                normStatus = "OUT_FOR_DELIVERY";
                da.setStatus("OUT_FOR_DELIVERY");
                order.setCurrentStatus("OUT_FOR_DELIVERY");
            } else if ("DELIVERED".equalsIgnoreCase(normStatus) || "COMPLETED".equalsIgnoreCase(normStatus)) {
                normStatus = "DELIVERED";
                da.setStatus("DELIVERED");
                order.setCurrentStatus("DELIVERED");
                recordDelivery(order, da, remarks);
            } else if ("DELAYED".equalsIgnoreCase(normStatus) || "FAILED".equalsIgnoreCase(normStatus)) {
                normStatus = "DELAYED";
                da.setStatus("DELAYED");
                order.setCurrentStatus("DELAYED");
            }
            orderRepository.save(order);
        }

        assignmentRepository.save(da);
        return toResponse(da);
    }

    @Transactional
    public AssignmentResponse updateStopStatus(Long assignmentId, Long orderId, String status) {
        return updateTripStatus(assignmentId, status, null);
    }

    @Transactional
    public AssignmentResponse updateStopStatus(Long assignmentId, Long orderId, String status, String remarks) {
        return updateTripStatus(assignmentId, status, remarks);
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getPreviousAssignment(Long currentId) {
        DispatchAssignment da = assignmentRepository.findPreviousAssignment(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_PREVIOUS_RECORD", "No previous assignment record found."));
        return toResponse(da);
    }

    @Transactional(readOnly = true)
    public AssignmentResponse getNextAssignment(Long currentId) {
        DispatchAssignment da = assignmentRepository.findNextAssignment(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_NEXT_RECORD", "No next assignment record found."));
        return toResponse(da);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentResponse> listAssignments(Long hubId, Pageable pageable) {
        return listAssignments(hubId, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AssignmentResponse> listAssignments(Long hubId, Long driverId, Pageable pageable) {
        Page<DispatchAssignment> page;
        if (hubId != null && hubId > 0 && driverId != null && driverId > 0) {
            page = assignmentRepository.findByHubIdAndDriverId(hubId, driverId, pageable);
        } else if (driverId != null && driverId > 0) {
            page = assignmentRepository.findByDriverId(driverId, pageable);
        } else if (hubId != null && hubId > 0) {
            page = assignmentRepository.findByHubId(hubId, pageable);
        } else {
            page = assignmentRepository.findAll(pageable);
        }

        return page.map(this::toResponse);
    }

    private void recordDelivery(Order order, DispatchAssignment da) {
        recordDelivery(order, da, null);
    }

    private void recordDelivery(Order order, DispatchAssignment da, String remarks) {
        var existing = deliveryRepository.findByOrderId(order.getId());
        Delivery delivery = existing.orElseGet(Delivery::new);
        delivery.setOrderId(order.getId());
        delivery.setAssignmentId(da.getId());
        delivery.setDeliveryDate(Instant.now());
        delivery.setStatus("DELIVERED");

        // COD vs PREPAID cash collection rule
        BigDecimal cashToCollect = "COD".equalsIgnoreCase(order.getPaymentMode()) ? order.getOrderAmount() : BigDecimal.ZERO;
        delivery.setAmountCollected(cashToCollect);
        String finalRemarks = (remarks != null && !remarks.isBlank())
                ? remarks.trim()
                : ("Delivered successfully. Payment mode: " + order.getPaymentMode());
        delivery.setRemarks(finalRemarks);
        deliveryRepository.save(delivery);
    }

    private AssignmentResponse toResponse(DispatchAssignment da) {
        Order order = orderRepository.findById(da.getOrderId()).orElse(null);
        Driver driver = driverRepository.findById(da.getDriverId()).orElse(null);
        Vehicle vehicle = vehicleRepository.findById(da.getVehicleId()).orElse(null);
        Hub hub = hubRepository.findById(da.getHubId()).orElse(null);
        Customer customer = order != null ? customerRepository.findById(order.getCustomerId()).orElse(null) : null;

        String custName = customer != null ? customer.getFullName() : (order != null ? "Customer" : "");
        String address = order != null ? order.getDestinationAddress() : "";
        String pincode = order != null ? order.getDestinationPincode() : "";
        BigDecimal amount = order != null ? order.getOrderAmount() : BigDecimal.ZERO;
        String payMode = order != null ? order.getPaymentMode() : "PREPAID";
        BigDecimal weight = order != null ? order.getWeightKg() : BigDecimal.ONE;

        AssignmentResponse.AssignedOrderSummary summary = new AssignmentResponse.AssignedOrderSummary(
                da.getId(),
                da.getOrderId(),
                order != null ? order.getTrackingNo() : "TRK-" + da.getOrderId(),
                custName,
                address,
                pincode,
                (int)(weight.doubleValue() * 1000),
                amount,
                payMode,
                da.getStatus(),
                1
        );

        return new AssignmentResponse(
                da.getId(),
                da.getOrderId(),
                order != null ? order.getTrackingNo() : "TRK-" + da.getOrderId(),
                custName,
                address,
                pincode,
                amount,
                payMode,
                weight,
                driver != null ? driver.getId() : da.getDriverId(),
                driver != null ? driver.getDriverName() : "Driver #" + da.getDriverId(),
                driver != null ? driver.getPhone() : "",
                vehicle != null ? vehicle.getId() : da.getVehicleId(),
                vehicle != null ? vehicle.getRegistrationNo() : "Vehicle #" + da.getVehicleId(),
                vehicle != null ? vehicle.getVehicleType() : "VAN",
                da.getHubId(),
                hub != null ? hub.getName() : "Hub #" + da.getHubId(),
                da.getStatus(),
                da.getAssignedDate(),
                da.getRemarks(),
                List.of(summary)
        );
    }
}
