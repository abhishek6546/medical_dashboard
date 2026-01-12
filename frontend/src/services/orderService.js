import api from './api';

export const orderService = {
    getOrders: async (page = 1, limit = 10, search = '', status = '') => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (status) params.append('status', status);

        const response = await api.get(`/orders?${params}`);
        return response.data;
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    updateOrderStatus: async (id, status) => {
        const response = await api.patch(`/orders/${id}/status`, { status });
        return response.data;
    }
};
