package com.logistic.services;

import com.logistic.dao.HubRepository;
import com.logistic.dao.VehicleRepository;
import com.logistic.dto.vehicle.VehicleRequest;
import com.logistic.dto.vehicle.VehicleResponse;
import com.logistic.entity.Hub;
import com.logistic.entity.Vehicle;
import com.logistic.exception.ConflictException;
import com.logistic.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final HubRepository hubRepository;

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        String regNo = request.registrationNo().trim().toUpperCase().replaceAll("\\s+", "-");

        if (vehicleRepository.existsByRegistrationNo(regNo)) {
            throw new ConflictException("VEHICLE_ALREADY_EXISTS", "Vehicle with registration " + regNo + " already exists.");
        }

        Hub hub = hubRepository.findById(request.hubId())
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + request.hubId()));

        Vehicle vehicle = new Vehicle();
        vehicle.setHubId(hub.getId());
        vehicle.setRegistrationNo(regNo);
        vehicle.setVehicleType(request.vehicleType());
        vehicle.setCapacityKg(request.capacityKg() != null ? request.capacityKg() : new BigDecimal("100.00"));
        vehicle.setStatus(request.status() != null ? request.status() : "AVAILABLE");
        vehicle = vehicleRepository.save(vehicle);

        return toResponse(vehicle, hub.getName());
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found with ID: " + id));

        Hub hub = hubRepository.findById(request.hubId())
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + request.hubId()));

        String regNo = request.registrationNo().trim().toUpperCase().replaceAll("\\s+", "-");
        if (!vehicle.getRegistrationNo().equals(regNo) && vehicleRepository.existsByRegistrationNo(regNo)) {
            throw new ConflictException("VEHICLE_ALREADY_EXISTS", "Vehicle with registration " + regNo + " already exists.");
        }

        vehicle.setHubId(hub.getId());
        vehicle.setRegistrationNo(regNo);
        vehicle.setVehicleType(request.vehicleType());
        if (request.capacityKg() != null) {
            vehicle.setCapacityKg(request.capacityKg());
        }
        if (request.status() != null) {
            vehicle.setStatus(request.status());
        }
        vehicle = vehicleRepository.save(vehicle);

        return toResponse(vehicle, hub.getName());
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VEHICLE_NOT_FOUND", "Vehicle not found with ID: " + id));

        Hub hub = hubRepository.findById(vehicle.getHubId()).orElse(null);
        return toResponse(vehicle, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public VehicleResponse getPreviousVehicle(Long currentId) {
        Vehicle vehicle = vehicleRepository.findPreviousVehicle(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_PREVIOUS_RECORD", "No previous vehicle found."));
        return getVehicleById(vehicle.getId());
    }

    @Transactional(readOnly = true)
    public VehicleResponse getNextVehicle(Long currentId) {
        Vehicle vehicle = vehicleRepository.findNextVehicle(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_NEXT_RECORD", "No next vehicle found."));
        return getVehicleById(vehicle.getId());
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponse> listVehicles(Long hubId, Pageable pageable) {
        Page<Vehicle> vehicles = (hubId != null && hubId > 0)
                ? vehicleRepository.findByHubId(hubId, pageable)
                : vehicleRepository.findAll(pageable);

        return vehicles.map(v -> {
            Hub hub = hubRepository.findById(v.getHubId()).orElse(null);
            return toResponse(v, hub != null ? hub.getName() : "");
        });
    }

    private VehicleResponse toResponse(Vehicle v, String hubName) {
        return new VehicleResponse(
                v.getId(),
                v.getHubId(),
                hubName,
                v.getRegistrationNo(),
                v.getVehicleType(),
                v.getCapacityKg(),
                BigDecimal.ZERO,
                v.getStatus()
        );
    }
}
