package com.logistic.dao;

import com.logistic.entity.DispatchAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchAssignmentRepository extends JpaRepository<DispatchAssignment, Long> {

    Optional<DispatchAssignment> findByOrderId(Long orderId);

    List<DispatchAssignment> findByDriverId(Long driverId);

    Page<DispatchAssignment> findByDriverId(Long driverId, Pageable pageable);

    Page<DispatchAssignment> findByHubIdAndDriverId(Long hubId, Long driverId, Pageable pageable);

    List<DispatchAssignment> findByDriverIdAndStatus(Long driverId, String status);

    Page<DispatchAssignment> findByHubId(Long hubId, Pageable pageable);

    @Query("SELECT da FROM DispatchAssignment da WHERE da.id < :id ORDER BY da.id DESC LIMIT 1")
    Optional<DispatchAssignment> findPreviousAssignment(@Param("id") Long id);

    @Query("SELECT da FROM DispatchAssignment da WHERE da.id > :id ORDER BY da.id ASC LIMIT 1")
    Optional<DispatchAssignment> findNextAssignment(@Param("id") Long id);
}
