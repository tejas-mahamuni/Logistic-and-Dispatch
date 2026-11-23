package com.logistic.dao;

import com.logistic.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhoneOrEmail(String phone, String email);

    @Query("SELECT c FROM Customer c WHERE c.id < :id ORDER BY c.id DESC LIMIT 1")
    Optional<Customer> findPreviousCustomer(@Param("id") Long id);

    @Query("SELECT c FROM Customer c WHERE c.id > :id ORDER BY c.id ASC LIMIT 1")
    Optional<Customer> findNextCustomer(@Param("id") Long id);

    @Query("SELECT c FROM Customer c WHERE LOWER(c.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR c.phone LIKE CONCAT('%', :query, '%')")
    Page<Customer> searchCustomers(@Param("query") String query, Pageable pageable);
}
