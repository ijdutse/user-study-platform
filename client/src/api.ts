import { API_URL } from './config';
import type { Video, Rating } from './types';

// Helper to handle API errors
const handleResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
        if (isJson) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `Request failed with status ${response.status}`);
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    }

    if (!isJson) {
        throw new Error("Invalid response format: Expected JSON");
    }

    return response.json();
};

// --- Public API ---

export const fetchVideos = async (): Promise<Video[]> => {
    const response = await fetch(`${API_URL}/videos`);
    const json = await handleResponse(response);
    return json.data;
};

export const submitDemographics = async (data: any) => {
    const response = await fetch(`${API_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const submitAttentionCheck = async (participantId: string, score: number) => {
    const response = await fetch(`${API_URL}/attention-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, score }),
    });
    return handleResponse(response);
};

export const submitRating = async (rating: Rating) => {
    const response = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating),
    });
    return handleResponse(response);
};

export const submitDebrief = async (participantId: string, feedback: string, compensationId: string) => {
    const response = await fetch(`${API_URL}/debrief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, feedback, compensation_id: compensationId }),
    });
    return handleResponse(response);
};

// --- Admin API ---

export const loginAdmin = async (password: string) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });
    return handleResponse(response);
};

export const uploadVideo = async (file: File | null, title: string, context: string, token: string, url?: string) => {
    const formData = new FormData();
    if (file) formData.append('video', file);
    formData.append('title', title);
    formData.append('context', context);
    if (url) formData.append('url', url);

    const response = await fetch(`${API_URL}/videos`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });
    return handleResponse(response);
};

export const updateVideo = async (id: number, title: string, context: string, token: string, url?: string) => {
    const response = await fetch(`${API_URL}/videos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, context, url }),
    });
    return handleResponse(response);
};

export const fetchAdminStats = async (token: string) => {
    const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};

export const exportRatings = async (token: string) => {
    const response = await fetch(`${API_URL}/admin/export/ratings`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to export ratings');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ratings_export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};

export const exportParticipants = async (token: string) => {
    const response = await fetch(`${API_URL}/admin/export/participants`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to export participants');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants_export.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};

export const fetchRawParticipants = async (token: string) => {
    const response = await fetch(`${API_URL}/admin/raw/participants`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const json = await handleResponse(response);
    return json.data;
};

export const fetchRawRatings = async (token: string) => {
    const response = await fetch(`${API_URL}/admin/raw/ratings`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const json = await handleResponse(response);
    return json.data;
};
