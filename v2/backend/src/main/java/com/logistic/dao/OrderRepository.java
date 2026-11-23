package com.logistic.dao;

import com.logistic.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByTrackingNo(String trackingNo);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Page<Order> findByHubId(Long hubId, Pageable pageable);

    List<Order> findByHubIdAndCurrentStatus(Long hubId, String currentStatus);

    @Query("SELECT o FROM Order o WHERE o.hubId = :hubId AND o.currentStatus = 'PENDING' " +
           "AND o.id NOT IN (SELECT da.orderId FROM DispatchAssignment da WHERE da.status != 'CANCELLED') " +
           "ORDER BY o.createdAt ASC")
    List<Order> findPendingUnassignedOrders(@Param("hubId") Long hubId);

    @Query("SELECT o FROM Order o WHERE o.currentStatus = 'PENDING' " +
           "AND o.id NOT IN (SELECT da.orderId FROM DispatchAssignment da WHERE da.status != 'CANCELLED') " +
           "ORDER BY o.createdAt ASC")
    List<Order> findAllPendingUnassignedOrders();

    @Query("SELECT o FROM Order o WHERE o.hubId = 1 AND o.currentStatus = 'PENDING' ORDER BY o.createdAt ASC")
    List<Order> findWarehouseTrunkOrders();

    @Query("SELECT o FROM Order o WHERE o.hubId = 1 AND o.currentStatus = 'PENDING' ORDER BY o.createdAt ASC")
    List<Order> findWarehouseTrunkOrders(@Param("hubId") Long hubId);

    @Query("SELECT o FROM Order o WHERE o.id < :id ORDER BY o.id DESC LIMIT 1")
    Optional<Order> findPreviousOrder(@Param("id") Long id);

    @Query("SELECT o FROM Order o WHERE o.id > :id ORDER BY o.id ASC LIMIT 1")
    Optional<Order> findNextOrder(@Param("id") Long id);
}
