const API_BASE = '/api/v1';

class ApiService {
  getToken() {
    return localStorage.getItem('nexus_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('nexus_token', token);
    } else {
      localStorage.removeItem('nexus_token');
    }
  }

  getUser() {
    const raw = localStorage.getItem('nexus_user');
    return raw ? JSON.parse(raw) : null;
  }

  setUser(user) {
    if (user) {
      localStorage.setItem('nexus_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nexus_user');
    }
  }

  logout() {
    this.setToken(null);
    this.setUser(null);
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      const errorMsg = data?.detail || 'An unexpected error occurred.';
      throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    return data;
  }

  // --- Auth APIs ---
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    this.setUser(data.user);
    return data;
  }

  async register(userData) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    const user = await this.request('/auth/me');
    this.setUser(user);
    return user;
  }

  // --- Ticket APIs ---
  async listTickets(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await this.request(`/tickets${qs}`);
  }

  async getTicket(id) {
    return await this.request(`/tickets/${id}`);
  }

  async createTicket(ticketData) {
    return await this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id, ticketData) {
    return await this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicketStatus(id, status, resolutionNotes = null) {
    return await this.request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution_notes: resolutionNotes }),
    });
  }

  async assignTicket(id, assignedToId, notes = '') {
    return await this.request(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to_id: assignedToId, notes }),
    });
  }

  async addComment(ticketId, comment, isInternal = false) {
    return await this.request(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, is_internal: isInternal }),
    });
  }

  async deleteTicket(id) {
    return await this.request(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Users APIs ---
  async listUsers(role = null) {
    const qs = role ? `?role=${encodeURIComponent(role)}` : '';
    return await this.request(`/users${qs}`);
  }

  async updateUser(id, updateData) {
    return await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // --- System Health ---
  async getHealth() {
    return await this.request('/health');
  }
}

export const api = new ApiService();
