package com.logistic.services;

import com.logistic.dao.DriverRepository;
import com.logistic.dao.HubRepository;
import com.logistic.dao.UserRepository;
import com.logistic.dto.driver.DriverRequest;
import com.logistic.dto.driver.DriverResponse;
import com.logistic.entity.Driver;
import com.logistic.entity.Hub;
import com.logistic.entity.User;
import com.logistic.exception.ConflictException;
import com.logistic.exception.ResourceNotFoundException;
import com.logistic.model.Role;
import com.logistic.model.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final HubRepository hubRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        String normalizedPhone = CustomerService.normalizePhone(request.phone());

        if (driverRepository.existsByLicenseNumber(request.licenseNumber().trim())) {
            throw new ConflictException("LICENSE_ALREADY_EXISTS", "A driver with license " + request.licenseNumber() + " already exists.");
        }

        Hub hub = hubRepository.findById(request.hubId())
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + request.hubId()));

        User user = userRepository.findByPhone(normalizedPhone).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername("drv." + request.phone().replaceAll("[^0-9]", ""));
            newUser.setFullName(request.resolveName());
            newUser.setPhone(normalizedPhone);
            newUser.setEmail("drv." + request.phone().replaceAll("[^0-9]", "") + "@logistic.local");
            newUser.setPasswordHash(passwordEncoder.encode("Secret@123"));
            newUser.setRole(Role.DRIVER);
            newUser.setHubId(hub.getId());
            newUser.setStatus(UserStatus.ACTIVE);
            return userRepository.save(newUser);
        });

        user.setRole(Role.DRIVER);
        user.setHubId(hub.getId());
        userRepository.save(user);

        Driver driver = new Driver();
        driver.setUserId(user.getId());
        driver.setHubId(hub.getId());
        driver.setDriverName(request.resolveName());
        driver.setPhone(normalizedPhone);
        driver.setLicenseNumber(request.licenseNumber().trim().toUpperCase());
        driver.setStatus("ACTIVE");
        driver.setMaxDailyOrders(request.maxDailyOrders() != null ? request.maxDailyOrders() : 60);
        driver = driverRepository.save(driver);

        return toResponse(driver, user, hub.getName());
    }

    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver not found with ID: " + id));

        Hub hub = hubRepository.findById(request.hubId())
                .orElseThrow(() -> new ResourceNotFoundException("HUB_NOT_FOUND", "Hub not found with ID: " + request.hubId()));

        User user = userRepository.findById(driver.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found for driver"));

        String normalizedPhone = CustomerService.normalizePhone(request.phone());
        user.setFullName(request.resolveName());
        user.setPhone(normalizedPhone);
        user.setHubId(hub.getId());
        userRepository.save(user);

        driver.setHubId(hub.getId());
        driver.setDriverName(request.resolveName());
        driver.setPhone(normalizedPhone);
        driver.setLicenseNumber(request.licenseNumber().trim().toUpperCase());
        if (request.maxDailyOrders() != null) {
            driver.setMaxDailyOrders(request.maxDailyOrders());
        }
        driver = driverRepository.save(driver);

        return toResponse(driver, user, hub.getName());
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver not found with ID: " + id));

        User user = userRepository.findById(driver.getUserId()).orElse(null);
        Hub hub = hubRepository.findById(driver.getHubId()).orElse(null);
        return toResponse(driver, user, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriverByUserId(Long userId) {
        Driver driver = driverRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("DRIVER_NOT_FOUND", "Driver profile not found for user ID: " + userId));

        User user = userRepository.findById(driver.getUserId()).orElse(null);
        Hub hub = hubRepository.findById(driver.getHubId()).orElse(null);
        return toResponse(driver, user, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public DriverResponse getPreviousDriver(Long currentId) {
        Driver driver = driverRepository.findPreviousDriver(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_PREVIOUS_RECORD", "No previous driver found."));
        return getDriverById(driver.getId());
    }

    @Transactional(readOnly = true)
    public DriverResponse getNextDriver(Long currentId) {
        Driver driver = driverRepository.findNextDriver(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_NEXT_RECORD", "No next driver found."));
        return getDriverById(driver.getId());
    }

    @Transactional(readOnly = true)
    public Page<DriverResponse> listDrivers(Long hubId, Pageable pageable) {
        Page<Driver> drivers = (hubId != null && hubId > 0)
                ? driverRepository.findByHubId(hubId, pageable)
                : driverRepository.findAll(pageable);

        return drivers.map(d -> {
            User user = userRepository.findById(d.getUserId()).orElse(null);
            Hub hub = hubRepository.findById(d.getHubId()).orElse(null);
            return toResponse(d, user, hub != null ? hub.getName() : "");
        });
    }

    private DriverResponse toResponse(Driver d, User user, String hubName) {
        return new DriverResponse(
                d.getId(),
                d.getUserId(),
                d.getDriverName(),
                user != null ? user.getUsername() : "",
                d.getPhone(),
                d.getLicenseNumber(),
                d.getHubId(),
                hubName,
                d.getMaxDailyOrders(),
                d.getStatus()
        );
    }
}
