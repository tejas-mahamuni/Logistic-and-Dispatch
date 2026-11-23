package com.logistic.services;

import com.logistic.dao.CustomerRepository;
import com.logistic.dao.HubRepository;
import com.logistic.dao.OrderRepository;
import com.logistic.dao.ServiceZoneRepository;
import com.logistic.dto.order.OrderRequest;
import com.logistic.dto.order.OrderResponse;
import com.logistic.entity.Customer;
import com.logistic.entity.Hub;
import com.logistic.entity.Order;
import com.logistic.entity.ServiceZone;
import com.logistic.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final AtomicLong TRACKING_SEQ = new AtomicLong(System.currentTimeMillis() % 1000000L);
    private static final java.util.Set<String> VALID_ORDER_STATUSES = java.util.Set.of(
            "PENDING", "ASSIGNED", "OUT_FOR_DELIVERY", "DELIVERED", "DELAYED", "CANCELLED"
    );

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final HubRepository hubRepository;
    private final ServiceZoneRepository zoneRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Customer customer = resolveCustomer(request);
        String destinationPincode = request.resolvePincode();
        Long hubId = resolveHubId(destinationPincode);

        Order order = new Order();
        order.setTrackingNo(generateTrackingNo());
        order.setCustomerId(customer.getId());
        order.setHubId(1L); // Inbound parcel arrives at Pune Central Sorting Warehouse (Hub #1)
        order.setSourceAddress((request.resolveSource() != null && !request.resolveSource().isBlank())
                ? request.resolveSource()
                : "Pune Central Sorting Warehouse, Chakan, Pune - 410501");
        order.setDestinationAddress(request.resolveDestination());
        order.setDestinationPincode(destinationPincode);
        order.setPaymentMode(request.resolvePaymentMode());
        order.setOrderAmount(request.resolveAmount());
        order.setWeightKg(request.resolveWeightKg());

        // Ensure current_status conforms strictly to MySQL constraint chk_orders_status
        // CHECK (current_status IN ('PENDING','ASSIGNED','OUT_FOR_DELIVERY','DELIVERED','DELAYED','CANCELLED'))
        String initialStatus = "PENDING";
        if (request.status() != null && !request.status().isBlank()) {
            String candidate = request.status().toUpperCase().trim();
            if (VALID_ORDER_STATUSES.contains(candidate)) {
                initialStatus = candidate;
            }
        }
        order.setCurrentStatus(initialStatus);
        order.setDispatchDate(LocalDate.now());
        order.setPromisedDate(request.promisedDate() != null ? request.promisedDate() : LocalDate.now().plusDays(1));

        order = orderRepository.save(order);

        Hub hub = hubRepository.findById(hubId).orElse(null);
        return toResponse(order, customer, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getWarehouseQueue(Long hubId) {
        List<Order> orders = orderRepository.findWarehouseTrunkOrders(hubId != null && hubId > 0 ? hubId : 1L);
        List<OrderResponse> responses = new ArrayList<>();
        for (Order o : orders) {
            Customer c = customerRepository.findById(o.getCustomerId()).orElse(null);
            Hub h = hubRepository.findById(o.getHubId()).orElse(null);
            responses.add(toResponse(o, c, h != null ? h.getName() : ""));
        }
        return responses;
    }

    @Transactional
    public List<OrderResponse> dispatchTrunkRoute(List<Long> orderIds, Long targetHubId, String remarks) {
        List<OrderResponse> responses = new ArrayList<>();
        if (orderIds == null || orderIds.isEmpty()) return responses;
        for (Long id : orderIds) {
            Order o = orderRepository.findById(id).orElse(null);
            if (o != null) {
                Long resolvedTarget = (targetHubId != null && targetHubId > 1)
                        ? targetHubId
                        : resolveHubId(o.getDestinationPincode());
                o.setHubId(resolvedTarget);
                o.setCurrentStatus("PENDING");
                o = orderRepository.save(o);
                Customer c = customerRepository.findById(o.getCustomerId()).orElse(null);
                Hub h = hubRepository.findById(resolvedTarget).orElse(null);
                responses.add(toResponse(o, c, h != null ? h.getName() : ""));
            }
        }
        return responses;
    }

    @Transactional
    public List<OrderResponse> autoShipAllWarehouseOrders() {
        List<Order> warehouseOrders = orderRepository.findWarehouseTrunkOrders(1L);
        List<Long> orderIds = warehouseOrders.stream().map(Order::getId).toList();
        return dispatchTrunkRoute(orderIds, null, "Auto-dispatched all warehouse parcels to target delivery hubs");
    }

    @Transactional
    public List<OrderResponse> receiveAtHub(List<Long> orderIds, Long hubId) {
        List<OrderResponse> responses = new ArrayList<>();
        if (orderIds == null || orderIds.isEmpty()) return responses;
        for (Long id : orderIds) {
            Order o = orderRepository.findById(id).orElse(null);
            if (o != null) {
                if (hubId != null && hubId > 0) {
                    o.setHubId(hubId);
                }
                o.setCurrentStatus("PENDING");
                o = orderRepository.save(o);
                Customer c = customerRepository.findById(o.getCustomerId()).orElse(null);
                Hub h = hubRepository.findById(o.getHubId()).orElse(null);
                responses.add(toResponse(o, c, h != null ? h.getName() : ""));
            }
        }
        return responses;
    }

    @Transactional
    public List<OrderResponse> createBulkOrders(List<OrderRequest> requests) {
        List<OrderResponse> responses = new ArrayList<>();
        for (OrderRequest req : requests) {
            responses.add(createOrder(req));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getPendingUnassignedOrders(Long hubId) {
        List<Order> orders = (hubId != null && hubId > 0)
                ? orderRepository.findPendingUnassignedOrders(hubId)
                : orderRepository.findAllPendingUnassignedOrders();

        List<OrderResponse> responses = new ArrayList<>();
        for (Order o : orders) {
            Customer c = customerRepository.findById(o.getCustomerId()).orElse(null);
            Hub h = hubRepository.findById(o.getHubId()).orElse(null);
            responses.add(toResponse(o, c, h != null ? h.getName() : ""));
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND", "Order not found with ID: " + id));

        Customer customer = customerRepository.findById(order.getCustomerId()).orElse(null);
        Hub hub = hubRepository.findById(order.getHubId()).orElse(null);
        return toResponse(order, customer, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByTrackingNo(String trackingNo) {
        Order order = orderRepository.findByTrackingNo(trackingNo.trim())
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND", "No active shipment found with tracking number: " + trackingNo));

        Customer customer = customerRepository.findById(order.getCustomerId()).orElse(null);
        Hub hub = hubRepository.findById(order.getHubId()).orElse(null);
        return toResponse(order, customer, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        Customer customer = customerRepository.findById(customerId).orElse(null);
        List<OrderResponse> responses = new ArrayList<>();
        for (Order o : orders) {
            Hub h = hubRepository.findById(o.getHubId()).orElse(null);
            responses.add(toResponse(o, customer, h != null ? h.getName() : ""));
        }
        return responses;
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ORDER_NOT_FOUND", "Order not found with ID: " + orderId));
        String candidate = (newStatus != null) ? newStatus.toUpperCase().trim() : "PENDING";
        if (VALID_ORDER_STATUSES.contains(candidate)) {
            order.setCurrentStatus(candidate);
        }
        order = orderRepository.save(order);

        Customer customer = customerRepository.findById(order.getCustomerId()).orElse(null);
        Hub hub = hubRepository.findById(order.getHubId()).orElse(null);
        return toResponse(order, customer, hub != null ? hub.getName() : "");
    }

    @Transactional(readOnly = true)
    public OrderResponse getPreviousOrder(Long currentId) {
        Order order = orderRepository.findPreviousOrder(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_PREVIOUS_RECORD", "No previous order found."));
        return getOrderById(order.getId());
    }

    @Transactional(readOnly = true)
    public OrderResponse getNextOrder(Long currentId) {
        Order order = orderRepository.findNextOrder(currentId)
                .orElseThrow(() -> new ResourceNotFoundException("NO_NEXT_RECORD", "No next order found."));
        return getOrderById(order.getId());
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> listOrders(Long hubId, Pageable pageable) {
        Page<Order> orders = hubId != null
                ? orderRepository.findByHubId(hubId, pageable)
                : orderRepository.findAll(pageable);

        return orders.map(o -> {
            Customer customer = customerRepository.findById(o.getCustomerId()).orElse(null);
            Hub hub = hubRepository.findById(o.getHubId()).orElse(null);
            return toResponse(o, customer, hub != null ? hub.getName() : "");
        });
    }

    private Customer resolveCustomer(OrderRequest req) {
        if (req.customerId() != null && req.customerId() > 0) {
            var existing = customerRepository.findById(req.customerId());
            if (existing.isPresent()) return existing.get();
        }

        String phone = req.resolvePhone();
        String normalizedPhone = CustomerService.normalizePhone(phone);
        if (normalizedPhone == null) normalizedPhone = phone;

        String searchPhone = normalizedPhone;
        var existingByPhone = customerRepository.findByPhone(searchPhone)
                .or(() -> customerRepository.findByPhone(phone));
        if (existingByPhone.isPresent()) {
            return existingByPhone.get();
        }

        // New customer on-the-fly
        Customer newCust = new Customer();
        newCust.setFullName(req.resolveName());
        newCust.setPhone(normalizedPhone);
        newCust.setEmail(req.customerEmail());
        newCust.setAddress(req.resolveDestination());
        newCust.setPincode(req.resolvePincode());
        newCust.setPasswordHash(passwordEncoder.encode(phone)); // default password = phone number
        newCust.setStatus("ACTIVE");
        try {
            return customerRepository.save(newCust);
        } catch (Exception ex) {
            return customerRepository.findByPhone(searchPhone)
                    .or(() -> customerRepository.findByPhone(phone))
                    .orElse(newCust);
        }
    }

    private Long resolveHubId(String pincode) {
        if (pincode != null && !pincode.isBlank()) {
            var zone = zoneRepository.findByPincode(pincode.trim());
            if (zone.isPresent() && zone.get().getHubId() != null) {
                return zone.get().getHubId();
            }
        }
        return hubRepository.findByStatus("ACTIVE").stream()
                .filter(h -> h.getHubType() == com.logistic.model.HubType.HUB)
                .map(Hub::getId)
                .findFirst()
                .orElse(2L);
    }

    private String generateTrackingNo() {
        long seq = TRACKING_SEQ.incrementAndGet();
        String rand = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        return "TRK-" + (seq % 1000000L) + "-" + rand;
    }

    private OrderResponse toResponse(Order o, Customer c, String hubName) {
        Long targetHubId = resolveHubId(o.getDestinationPincode());
        Hub targetHub = (targetHubId != null) ? hubRepository.findById(targetHubId).orElse(null) : null;
        String targetHubName = (targetHub != null) ? targetHub.getName() : ("Hub #" + targetHubId);

        return new OrderResponse(
                o.getId(),
                o.getTrackingNo(),
                o.getCustomerId(),
                c != null ? c.getFullName() : "Customer",
                c != null ? c.getPhone() : "",
                o.getHubId(),
                hubName,
                targetHubId,
                targetHubName,
                o.getSourceAddress(),
                o.getDestinationAddress(),
                o.getDestinationPincode(),
                o.getOrderAmount(),
                o.getPaymentMode(),
                o.getWeightKg(),
                o.getCurrentStatus(),
                o.getDispatchDate(),
                o.getPromisedDate(),
                o.getCreatedAt()
        );
    }
}
