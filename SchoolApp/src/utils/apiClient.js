import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './env';

const API_BASE = API_URL;

export async function apiFetch(endpoint, options = {}) {
  try {
    // console.log(`Fetching: ${API_BASE}${endpoint}`);
    
    // Get stored JWT
    const token = await AsyncStorage.getItem('token');
    // console.log(`Retrieved token: ${token}`);
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    // console.log(`${options.method} ${API_BASE}/api${endpoint} with headers:`, headers);
    
    // Perform fetch
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      ...options,
      headers,
    });

    // Handle unauthorized
    if (response.status === 401) {
      // Optionally clear token and redirect to login
      // await AsyncStorage.removeItem('token');
      throw new Error('Session expired. Please log in again.');
    }

    // Parse JSON
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
// console.log('API Response Data:', data);

    return data;
  } catch (err) {
    console.error(`API Error: ${err.message}`);
    throw err;
  }
}
