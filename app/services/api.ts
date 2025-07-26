import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useRouter } from 'expo-router';

const API_BASE_URL = 'http://192.168.1.72:3000';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
const router = useRouter();

    const token = await AsyncStorage.getItem('token');
    // console.log('Token retrieved:', token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.warn('No token found, proceeding without authorization header.');
        router.replace('/login/presentation/Login'); // Redirect to login if no token
    }
    // console.log(config.headers.Authorization)
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use((response) => {
const router = useRouter();

    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        console.error('Unauthorized access - redirecting to login.');
        console.log('Error details:', error.response.data);
        // Handle unauthorized access, e.g., redirect to login page
        router.replace('/login/presentation/Login');
    } else {
        console.error('Response error:', error);
    }
    return Promise.reject(error);
});

export default api;