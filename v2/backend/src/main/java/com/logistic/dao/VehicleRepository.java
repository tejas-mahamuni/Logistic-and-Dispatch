package com.logistic.dao;

import com.logistic.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByRegistrationNo(String registrationNo);

    boolean existsByRegistrationNo(String registrationNo);

    List<Vehicle> findByHubIdAndStatus(Long hubId, String status);

    List<Vehicle> findByHubId(Long hubId);

    @Query("SELECT v FROM Vehicle v WHERE v.id < :id ORDER BY v.id DESC LIMIT 1")
    Optional<Vehicle> findPreviousVehicle(@Param("id") Long id);

    @Query("SELECT v FROM Vehicle v WHERE v.id > :id ORDER BY v.id ASC LIMIT 1")
    Optional<Vehicle> findNextVehicle(@Param("id") Long id);

    Page<Vehicle> findByHubId(Long hubId, Pageable pageable);
}
