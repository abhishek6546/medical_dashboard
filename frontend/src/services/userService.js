import api from './api';

export const userService = {
    getUsers: async (page = 1, limit = 10, search = '', status = '') => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (status) params.append('status', status);

        const response = await api.get(`/users?${params}`);
        return response.data;
    },

    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    toggleUserStatus: async (id) => {
        const response = await api.patch(`/users/${id}/toggle`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    uploadImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        const response = await api.post('/users/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};
