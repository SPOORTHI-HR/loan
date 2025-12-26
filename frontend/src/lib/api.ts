
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const { token } = JSON.parse(user);
        return { Authorization: `Bearer ${token}` };
    }
    return {};
};

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
    const headers = getAuthHeader();
    if (headers.Authorization) {
        config.headers.Authorization = headers.Authorization;
    }
    return config;
});

export const officerApi = {
    getLoans: async () => {
        const response = await api.get('/officer/loans');
        return response.data;
    },
    getLoanById: async (id: string) => {
        const response = await api.get(`/officer/loan/${id}`);
        return response.data;
    },
    reviewLoan: async (id: string) => {
        const response = await api.post(`/officer/loan/${id}/review`);
        return response.data;
    },
    approveLoan: async (id: string) => {
        const response = await api.post(`/officer/loan/${id}/approve`);
        return response.data;
    },
    rejectLoan: async (id: string, reason?: string) => {
        const response = await api.post(`/officer/loan/${id}/reject`, { reason });
        return response.data;
    }
};
