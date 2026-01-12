import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const medicineService = {
    getMedicines: async (page = 1, limit = 10, search = '', category = '', stockStatus = '') => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (stockStatus) params.append('stockStatus', stockStatus);

        const response = await api.get(`/medicines?${params}`);
        return response.data;
    },

    getMedicineById: async (id) => {
        const response = await api.get(`/medicines/${id}`);
        return response.data;
    },

    createMedicine: async (formData) => {
        const response = await api.post('/medicines', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    updateMedicine: async (id, formData) => {
        const response = await api.put(`/medicines/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteMedicine: async (id) => {
        const response = await api.delete(`/medicines/${id}`);
        return response.data;
    },

    getImageUrl: (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL.replace('/api', '')}${imagePath}`;
    }
};
