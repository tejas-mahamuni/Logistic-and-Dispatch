package com.logistic.dao;

import com.logistic.entity.Driver;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByUserId(Long userId);

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    boolean existsByLicenseNumber(String licenseNumber);

    List<Driver> findByHubIdAndStatus(Long hubId, String status);

    List<Driver> findByHubId(Long hubId);

    @Query("SELECT d FROM Driver d WHERE d.id < :id ORDER BY d.id DESC LIMIT 1")
    Optional<Driver> findPreviousDriver(@Param("id") Long id);

    @Query("SELECT d FROM Driver d WHERE d.id > :id ORDER BY d.id ASC LIMIT 1")
    Optional<Driver> findNextDriver(@Param("id") Long id);

    Page<Driver> findByHubId(Long hubId, Pageable pageable);
}
