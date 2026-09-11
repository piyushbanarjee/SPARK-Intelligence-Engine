import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  // Do NOT set a global Content-Type here so Axios can automatically handle FormData boundaries natively.
  // Axios will automatically set application/json for object payloads.
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (badge_number, password) => {
  try {
    const params = new URLSearchParams();
    params.append('username', badge_number);
    params.append('password', password);
    
    // Changed to have trailing slash to enforce consistency across the stack
    const response = await apiClient.post('/users/token/', params); 
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const registerUser = async (badge_number, password) => {
  try {
    const response = await apiClient.post('/users/', {
      badge_number,
      password,
      role: 'OPERATIVE'
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const getCases = async () => {
  try {
    const response = await apiClient.get('/cases/');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch cases:', error);
    throw error;
  }
};

export const uploadEvidence = async (caseId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploader_id', '123e4567-e89b-12d3-a456-426614174000');
    
    const response = await apiClient.post(`/cases/${caseId}/evidence/`, formData);
    return response.data;
  } catch (error) {
    console.error('Failed to upload evidence:', error);
    throw error;
  }
};

export const getNotes = async (caseId) => {
  try {
    const response = await apiClient.get(`/cases/${caseId}/notes/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    throw error;
  }
};

export const createNote = async (caseId, noteData) => {
  try {
    noteData.author_id = '123e4567-e89b-12d3-a456-426614174000';
    const response = await apiClient.post(`/cases/${caseId}/notes/`, noteData);
    return response.data;
  } catch (error) {
    console.error('Failed to create note:', error);
    throw error;
  }
};

export const getEntities = async (caseId) => {
  try {
    const response = await apiClient.get(`/cases/${caseId}/entities/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch entities:', error);
    throw error;
  }
};

export const getGraphData = async (caseId) => {
  try {
    const response = await apiClient.get(`/cases/${caseId}/graph/`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    throw error;
  }
};

export const chatWithAI = async (caseId, message) => {
  try {
    const response = await apiClient.post(`/cases/${caseId}/chat/`, {
      message: message,
      author_id: '123e4567-e89b-12d3-a456-426614174000'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to chat with AI:', error);
    throw error;
  }
};

export default apiClient;
