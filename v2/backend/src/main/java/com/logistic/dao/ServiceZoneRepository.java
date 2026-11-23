package com.logistic.dao;

import com.logistic.entity.ServiceZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceZoneRepository extends JpaRepository<ServiceZone, Long> {

    Optional<ServiceZone> findByPincode(String pincode);

    List<ServiceZone> findByHubId(Long hubId);

    boolean existsByPincode(String pincode);
}
