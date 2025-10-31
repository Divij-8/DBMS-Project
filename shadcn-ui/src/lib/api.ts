// API service for communicating with Django backend
const API_BASE_URL = (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Auth endpoints
  async register(data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: 'farmer' | 'buyer';
  }) {
    return this.post('/auth/register/', data);
  }

  async login(email: string, password: string) {
    const response = await this.post('/token/', { username: email, password });
    if (response.access) {
      this.setToken(response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
    return response;
  }

  async getCurrentUser() {
    return this.get('/auth/user/');
  }

  async updateProfile(data: any) {
    return this.put('/user/profile/', data);
  }

  // Products endpoints
  async getProducts(filters?: { category?: string; search?: string }) {
    let url = '/products/';
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (params.toString()) url += `?${params.toString()}`;
    return this.get(url);
  }

  async getProductById(id: string) {
    return this.get(`/products/${id}/`);
  }

  async createProduct(data: any) {
    return this.post('/products/', data);
  }

  async updateProduct(id: string, data: any) {
    return this.put(`/products/${id}/`, data);
  }

  async deleteProduct(id: string) {
    return this.delete(`/products/${id}/`);
  }

  async getMyProducts() {
    return this.get('/products/my_products/');
  }

  // Equipment endpoints
  async getEquipment(filters?: { equipment_type?: string; status?: string }) {
    let url = '/equipment/';
    const params = new URLSearchParams();
    if (filters?.equipment_type) params.append('equipment_type', filters.equipment_type);
    if (filters?.status) params.append('status', filters.status);
    if (params.toString()) url += `?${params.toString()}`;
    return this.get(url);
  }
  async getEquipmentById(id: string) {
    return this.get(`/equipment/${id}/`);
  }
  async createEquipment(data: any) {
    return this.post('/equipment/', data);
  }
  async updateEquipment(id: string, data: any) {
    return this.put(`/equipment/${id}/`, data);
  }
  async deleteEquipment(id: string) {
    return this.delete(`/equipment/${id}/`);
  }
  async getMyEquipment() {
    return this.get('/equipment/my_equipment/');
  }
  async getAvailableEquipment() {
    return this.get('/equipment/available_equipment/');
  }
  async getEquipmentAvailableDates(id: string) {
    return this.get(`/equipment/${id}/available_dates/`);
  }

  // Equipment Rental endpoints
  async getEquipmentRentals(filters?: { status?: string; equipment?: string }) {
    let url = '/equipment-rentals/';
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.equipment) params.append('equipment', filters.equipment);
    if (params.toString()) url += `?${params.toString()}`;
    return this.get(url);
  }
  async getEquipmentRentalById(id: string) {
    return this.get(`/equipment-rentals/${id}/`);
  }
  async createEquipmentRental(data: any) {
    return this.post('/equipment-rentals/', data);
  }
  async updateEquipmentRental(id: string, data: any) {
    return this.put(`/equipment-rentals/${id}/`, data);
  }
  async getMyRentals() {
    return this.get('/equipment-rentals/my_rentals/');
  }
  async getMyEquipmentRentals() {
    return this.get('/equipment-rentals/my_equipment_rentals/');
  }
  async confirmRental(id: string) {
    return this.post(`/equipment-rentals/${id}/confirm_rental/`, {});
  }
  async cancelRental(id: string) {
    return this.post(`/equipment-rentals/${id}/cancel_rental/`, {});
  }
  async completeRental(id: string) {
    return this.post(`/equipment-rentals/${id}/complete_rental/`, {});
  }

  // Farm data endpoints
  async getFarmData() {
    return this.get('/farm-data/');
  }

  async createFarmData(data: any) {
    return this.post('/farm-data/', data);
  }

  async updateFarmData(id: string, data: any) {
    return this.put(`/farm-data/${id}/`, data);
  }

  async deleteFarmData(id: string) {
    return this.delete(`/farm-data/${id}/`);
  }

  // Alerts endpoints
  async getAlerts() {
    return this.get('/alerts/');
  }

  async createAlert(data: any) {
    return this.post('/alerts/', data);
  }

  async updateAlert(id: string, data: any) {
    return this.put(`/alerts/${id}/`, data);
  }

  async deleteAlert(id: string) {
    return this.delete(`/alerts/${id}/`);
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.get('/dashboard/stats/');
  }

  // Generic methods
  async get(endpoint: string) {
    return this._get(endpoint);
  }
  async post(endpoint: string, data: any) {
    return this._post(endpoint, data);
  }
  async put(endpoint: string, data: any) {
    return this._put(endpoint, data);
  }
  async patch(endpoint: string, data: any) {
    return this._patch(endpoint, data);
  }
  async delete(endpoint: string) {
    return this._delete(endpoint);
  }
  private async _get(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('GET error:', error);
      throw error;
    }
  }
  private async _post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('POST error:', error);
      throw error;
    }
  }
  private async _put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('PUT error:', error);
      throw error;
    }
  }
  private async _patch(endpoint: string, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('PATCH error:', error);
      throw error;
    }
  }
  private async _delete(endpoint: string) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('DELETE error:', error);
      throw error;
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.detail || error.message || 'API error');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }
}

export const apiService = new ApiService();
