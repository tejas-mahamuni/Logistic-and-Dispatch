package com.logistic.services;

import com.logistic.dao.CustomerRepository;
import com.logistic.dto.customer.CustomerRequest;
import com.logistic.dto.customer.CustomerResponse;
import com.logistic.entity.Customer;
import com.logistic.exception.ConflictException;
import com.logistic.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        String normalizedPhone = normalizePhone(request.phone());

        if (customerRepository.findByPhone(normalizedPhone).isPresent()) {
            throw new ConflictException("PHONE_ALREADY_EXISTS", "A customer with phone " + normalizedPhone + " already exists.");
        }

        Customer customer = new Customer();
        customer.setFullName(request.fullName().trim());
        customer.setPhone(normalizedPhone);
        customer.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        customer.setAddress(request.resolvedAddress());
        customer.setPincode(request.pincode().trim());
        customer.setPasswordHash(passwordEncoder.encode(normalizedPhone)); // default initial password = mobile number
        customer.setStatus("ACTIVE");
        customer = customerRepository.save(customer);

        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CUSTOMER_NOT_FOUND", "Customer not found with ID: " + id));

        String normalizedPhone = normalizePhone(request.phone());
        var existingWithPhone = customerRepository.findByPhone(normalizedPhone);
        if (existingWithPhone.isPresent() && !existingWithPhone.get().getId().equals(id)) {
            throw new ConflictException("PHONE_ALREADY_EXISTS", "A customer with phone " + normalizedPhone + " already exists.");
        }

        customer.setFullName(request.fullName().trim());
        customer.setPhone(normalizedPhone);
        if (request.email() != null) {
            customer.setEmail(request.email().trim().toLowerCase());
        }
        customer.setAddress(request.resolvedAddress());
        customer.setPincode(request.pincode().trim());
        customer = customerRepository.save(customer);

        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CUSTOMER_NOT_FOUND", "Customer not found with ID: " + id));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByPhone(String phone) {
        String normalized = normalizePhone(phone);
        Customer customer = customerRepository.findByPhone(normalized)
                .or(() -> customerRepository.findByPhone(phone.trim()))
                .orElseThrow(() -> new ResourceNotFoundException("CUSTOMER_NOT_FOUND", "Customer not found with phone: " + phone));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getPreviousCustomer(Long currentId) {
        Customer customer = customerRepository.findPreviousCustomer(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_PREVIOUS_RECORD", "No previous customer found."));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getNextCustomer(Long currentId) {
        Customer customer = customerRepository.findNextCustomer(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_NEXT_RECORD", "No next customer found."));
        return toResponse(customer);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String query, Pageable pageable) {
        String q = query != null ? query.trim() : "";
        return customerRepository.searchCustomers(q, pageable)
                .map(this::toResponse);
    }

    public static String normalizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() == 10) {
            return "+91" + digits;
        } else if (digits.length() == 12 && digits.startsWith("91")) {
            return "+" + digits;
        }
        return phone.trim();
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(
                c.getId(),
                c.getFullName(),
                c.getPhone(),
                c.getEmail(),
                c.getAddress(),
                c.getAddress(),
                "Pune",
                c.getPincode(),
                c.getStatus()
        );
    }
}
