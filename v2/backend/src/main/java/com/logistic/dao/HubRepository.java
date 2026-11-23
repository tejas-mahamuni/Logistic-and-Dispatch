package com.logistic.dao;

import com.logistic.entity.Hub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HubRepository extends JpaRepository<Hub, Long> {

    Optional<Hub> findByCode(String code);

    boolean existsByCode(String code);

    List<Hub> findByRegionId(Long regionId);

    List<Hub> findByStatus(String status);
}
