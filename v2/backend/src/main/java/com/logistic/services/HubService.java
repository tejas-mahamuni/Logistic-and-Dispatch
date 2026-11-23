package com.logistic.services;

import com.logistic.dao.HubRepository;
import com.logistic.dao.ServiceZoneRepository;
import com.logistic.dto.hub.HubRequest;
import com.logistic.dto.hub.HubResponse;
import com.logistic.dto.hub.ZoneRequest;
import com.logistic.entity.Hub;
import com.logistic.entity.ServiceZone;
import com.logistic.exception.ConflictException;
import com.logistic.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HubService {

    private final HubRepository hubRepository;
    private final ServiceZoneRepository serviceZoneRepository;

    @Transactional(readOnly = true)
    public List<HubResponse> listAllActive() {
        return hubRepository.findByStatus("ACTIVE").stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public HubResponse getById(Long id) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + id));
        return toResponse(hub);
    }

    @Transactional
    public HubResponse create(HubRequest req) {
        if (hubRepository.existsByCode(req.code())) {
            throw new ConflictException("HUB_CODE_EXISTS", "A hub with code '" + req.code() + "' already exists");
        }

        Hub hub = new Hub();
        copyFields(req, hub);
        hub.setStatus("ACTIVE");
        hub.setCreatedAt(Instant.now());
        hub.setUpdatedAt(Instant.now());

        return toResponse(hubRepository.save(hub));
    }

    @Transactional
    public HubResponse update(Long id, HubRequest req) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + id));

        if (!hub.getCode().equals(req.code()) && hubRepository.existsByCode(req.code())) {
            throw new ConflictException("HUB_CODE_EXISTS", "A hub with code '" + req.code() + "' already exists");
        }

        copyFields(req, hub);
        hub.setUpdatedAt(Instant.now());

        return toResponse(hubRepository.save(hub));
    }

    @Transactional
    public HubResponse setStatus(Long id, String status) {
        Hub hub = hubRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + id));
        hub.setStatus(status);
        hub.setUpdatedAt(Instant.now());
        return toResponse(hubRepository.save(hub));
    }

    @Transactional(readOnly = true)
    public List<ServiceZone> getZones(Long hubId) {
        if (!hubRepository.existsById(hubId)) {
            throw new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + hubId);
        }
        return serviceZoneRepository.findByHubId(hubId);
    }

    @Transactional
    public ServiceZone addZone(Long hubId, ZoneRequest req) {
        if (!hubRepository.existsById(hubId)) {
            throw new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + hubId);
        }
        if (serviceZoneRepository.existsByPincode(req.pincode())) {
            throw new ConflictException("PINCODE_EXISTS", "Pincode '" + req.pincode() + "' is already assigned to a hub");
        }

        ServiceZone zone = new ServiceZone();
        zone.setHubId(hubId);
        zone.setPincode(req.pincode());
        zone.setAreaName(req.areaName());
        zone.setStatus("ACTIVE");
        zone.setCreatedAt(Instant.now());
        zone.setUpdatedAt(Instant.now());

        return serviceZoneRepository.save(zone);
    }

    @Transactional
    public void removeZone(Long hubId, Long zoneId) {
        ServiceZone zone = serviceZoneRepository.findById(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("ZONE_NOT_FOUND", "Zone not found with ID: " + zoneId));

        if (!zone.getHubId().equals(hubId)) {
            throw new ResourceNotFoundException("ZONE_MISMATCH", "Zone does not belong to hub ID: " + hubId);
        }

        serviceZoneRepository.delete(zone);
    }

    private void copyFields(HubRequest req, Hub hub) {
        hub.setRegionId(req.regionId());
        hub.setParentHubId(req.parentHubId());
        hub.setCode(req.code());
        hub.setName(req.name());
        hub.setHubType(req.hubType() != null ? req.hubType() : com.logistic.model.HubType.HUB);
        hub.setAddressLine(req.addressLine());
        hub.setPincode(req.pincode());
        hub.setManagerUserId(req.managerUserId());
    }

    public HubResponse toResponse(Hub h) {
        return new HubResponse(
                h.getId(),
                h.getRegionId(),
                h.getParentHubId(),
                h.getCode(),
                h.getName(),
                h.getHubType() != null ? h.getHubType() : com.logistic.model.HubType.HUB,
                h.getAddressLine(),
                h.getPincode(),
                null,
                null,
                null,
                h.getStatus()
        );
    }
}
