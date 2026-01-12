import api from './api';

export const dashboardService = {
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    getLowStockMedicines: async () => {
        const response = await api.get('/dashboard/low-stock');
        return response.data;
    },

    getExpiringMedicines: async () => {
        const response = await api.get('/dashboard/expiring');
        return response.data;
    }
};
