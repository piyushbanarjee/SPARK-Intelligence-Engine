import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

export const apiClient = {
  createCase: async (title, description) => {
    const response = await api.post('/cases/', { title, description });
    return response.data;
  },

  uploadEvidence: async (caseId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/cases/${caseId}/evidence/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEvidence: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/evidence/`);
    return response.data;
  },

  chat: async (caseId, prompt) => {
    const response = await api.post(`/cases/${caseId}/chat/`, { prompt });
    return response.data;
  },

  getGraph: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/graph/`);
    return response.data;
  },

  getNotes: async (caseId) => {
    const response = await api.get(`/cases/${caseId}/notes/`);
    return response.data;
  },

  createNote: async (caseId, content) => {
    const response = await api.post(`/cases/${caseId}/notes/`, { content });
    return response.data;
  },

  getRegistry: async (caseId) => {
    // Backend doesn't have this yet, returning mock or empty to prevent crashes
    try {
      const response = await api.get(`/cases/${caseId}/registry/`);
      return response.data;
    } catch {
      return [];
    }
  },

  getTimeline: async (caseId) => {
    // Backend doesn't have this yet, returning empty
    try {
      const response = await api.get(`/cases/${caseId}/timeline/`);
      return response.data;
    } catch {
      return [];
    }
  },
};

