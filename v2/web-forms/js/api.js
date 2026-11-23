/**
 * Central API Client for Logistic and Dispatch v2 Web Forms
 * Connects to Spring Boot Core API on port 8080
 */
const API_BASE = 'http://localhost:8080/api/v1';

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            let errorMessage = `Request failed with status ${response.status}`;
            if (data?.invalidFields && Array.isArray(data.invalidFields) && data.invalidFields.length > 0) {
                errorMessage = data.invalidFields.join('; ');
            } else if (data?.message && data.message !== 'Validation failed') {
                errorMessage = data.message;
            } else if (data?.detail && data.detail !== 'Validation failed') {
                errorMessage = data.detail;
            } else if (data?.message) {
                errorMessage = data.message;
            } else if (data?.detail) {
                errorMessage = data.detail;
            } else if (data?.title) {
                errorMessage = data.title;
            }
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (!err.status) {
            console.error('Network/Connection error:', err);
            const netErr = new Error('Cannot connect to backend server. Please ensure Spring Boot is running on port 8080.');
            netErr.status = 0;
            throw netErr;
        }
        throw err;
    }
}

export const AuthApi = {
    login: async (username, password) => {
        const res = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (res && res.accessToken) {
            localStorage.setItem('access_token', res.accessToken);
            localStorage.setItem('user', JSON.stringify(res));
        }
        return res;
    },
    logout: async () => {
        try {
            await request('/auth/logout', { method: 'POST' });
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
        }
    },
    me: () => request('/auth/me')
};

export const CustomerApi = {
    get: (id) => request(`/customers/${id}`),
    getByPhone: (phone) => request(`/customers/by-phone?phone=${encodeURIComponent(phone)}`),
    getPrevious: (id) => request(`/customers/${id}/previous`),
    getNext: (id) => request(`/customers/${id}/next`),
    create: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    search: (query = '') => request(`/customers?query=${encodeURIComponent(query)}`)
};

export const DriverApi = {
    get: (id) => request(`/drivers/${id}`),
    getPrevious: (id) => request(`/drivers/${id}/previous`),
    getNext: (id) => request(`/drivers/${id}/next`),
    create: (data) => request('/drivers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    list: (hubId = '') => request(`/drivers${hubId ? `?hubId=${hubId}` : ''}`)
};

export const VehicleApi = {
    get: (id) => request(`/vehicles/${id}`),
    getPrevious: (id) => request(`/vehicles/${id}/previous`),
    getNext: (id) => request(`/vehicles/${id}/next`),
    create: (data) => request('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    list: (hubId = '') => request(`/vehicles${hubId ? `?hubId=${hubId}` : ''}`)
};

export const OrderApi = {
    get: (id) => request(`/orders/${id}`),
    getPrevious: (id) => request(`/orders/${id}/previous`),
    getNext: (id) => request(`/orders/${id}/next`),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    list: (hubId = '') => request(`/orders${hubId ? `?hubId=${hubId}` : ''}`),
    getPending: (hubId = '') => request(`/orders/pending${hubId ? `?hubId=${hubId}` : ''}`),
    getMyOrders: () => request('/orders/my-orders'),
    track: (trackingNo) => request(`/orders/track/${encodeURIComponent(trackingNo)}`),
    updateStatus: (id, status) => request(`/orders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' })
};

export const HubApi = {
    list: async () => {
        const res = await request('/hubs');
        return Array.isArray(res) ? res : (res?.content || res?.data || []);
    },
    get: (id) => request(`/hubs/${id}`),
    getZones: (id) => request(`/hubs/${id}/service-zones`)
};

export const AssignmentApi = {
    get: (id) => request(`/assignments/${id}`),
    getPrevious: (id) => request(`/assignments/${id}/previous`),
    getNext: (id) => request(`/assignments/${id}/next`),
    create: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) }),
    autoAssign: (hubId = '') => request(`/assignments/auto-assign${hubId ? `?hubId=${hubId}` : ''}`, { method: 'POST' }),
    list: (hubId = '') => request(`/assignments${hubId ? `?hubId=${hubId}` : ''}`),
    updateTripStatus: (id, status) => request(`/assignments/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
    updateStopStatus: (tripId, stopId, status) => request(`/assignments/${tripId}/stops/${stopId}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
    getDriverToday: (driverId) => request(`/assignments/driver/${driverId}/today`)
};
