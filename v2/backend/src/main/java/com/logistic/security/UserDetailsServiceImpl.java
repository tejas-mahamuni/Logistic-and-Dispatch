package com.logistic.security;

import com.logistic.dao.CustomerRepository;
import com.logistic.dao.UserRepository;
import com.logistic.entity.Customer;
import com.logistic.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    public UserDetailsServiceImpl(UserRepository userRepository, CustomerRepository customerRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Try staff users
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            return new AppUserDetails(user);
        }

        // 2. Try customer by phone or email
        Customer customer = customerRepository.findByPhone(username)
                .or(() -> customerRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User or Customer not found: " + username));

        return new AppUserDetails(customer);
    }
}
