import axios from 'axios';

class ConnectivityService {
  constructor(apiUrl = process.env.API_BASE_URL || 'http://localhost:3000/api') {
    this.apiUrl = apiUrl;
  }

  async checkConnectivity() {
    try {
      await axios.get(`${this.apiUrl}/health`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async sendToServer(endpoint, data) {
    try {
      const response = await axios.post(`${this.apiUrl}${endpoint}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async fetchFromServer(endpoint) {
    try {
      const response = await axios.get(`${this.apiUrl}${endpoint}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export { ConnectivityService };
