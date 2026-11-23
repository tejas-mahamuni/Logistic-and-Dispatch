package com.logistic.controller;

import com.logistic.dto.customer.CustomerRequest;
import com.logistic.dto.customer.CustomerResponse;
import com.logistic.services.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "Endpoints for Customer Master Entry & Navigation")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create customer (New mode)")
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        CustomerResponse response = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer (Find mode)")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request
    ) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find customer by ID")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/by-phone")
    @Operation(summary = "Find customer by Phone Number")
    public ResponseEntity<CustomerResponse> getCustomerByPhone(@RequestParam String phone) {
        return ResponseEntity.ok(customerService.getCustomerByPhone(phone));
    }

    @GetMapping("/{id}/previous")
    @Operation(summary = "Get previous customer record")
    public ResponseEntity<CustomerResponse> getPreviousCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getPreviousCustomer(id));
    }

    @GetMapping("/{id}/next")
    @Operation(summary = "Get next customer record")
    public ResponseEntity<CustomerResponse> getNextCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getNextCustomer(id));
    }

    @GetMapping
    @Operation(summary = "Search customers with pagination")
    public ResponseEntity<Page<CustomerResponse>> searchCustomers(
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(customerService.searchCustomers(query, pageable));
    }
}
