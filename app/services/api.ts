import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.100.4:3000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = AsyncStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('No token found, proceeding without authorization header.');
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        console.error('Unauthorized access - redirecting to login.');
        console.log('Error details:', error.response.data);
        // Handle unauthorized access, e.g., redirect to login page
    } else {
        console.error('Response error:', error);
    }
    return Promise.reject(error);
});

export default api;