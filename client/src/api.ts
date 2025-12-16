import { API_BASE_URL } from './config';
import type { Video, Rating } from './types';

// Helper to handle API errors
const handleResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
        if (isJson) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `Request failed with status ${response.status} `);
        } else {
            throw new Error(`Request failed with status ${response.status} `);
        }
    }

    if (!isJson) {
        throw new Error("Invalid response format: Expected JSON");
    }

    return response.json();
};

// --- Public API ---

export const fetchVideos = async (): Promise<Video[]> => {
    const response = await fetch(`${API_BASE_URL}/videos`);
    const json = await handleResponse(response);
    return json.data;
};

export const submitDemographics = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const submitAttentionCheck = async (participantId: string, score: number) => {
    const response = await fetch(`${API_BASE_URL}/attention-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, score }),
    });
    return handleResponse(response);
};

export const submitRating = async (rating: Rating) => {
    const response = await fetch(`${API_BASE_URL}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating),
    });
    return handleResponse(response);
};

export const submitDebrief = async (participantId: string, feedback: string, compensationId: string) => {
    const response = await fetch(`${API_BASE_URL}/debrief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: participantId, feedback, compensation_id: compensationId }),
    });
    return handleResponse(response);
};

// --- Admin API ---

export const loginAdmin = async (password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    });
    return handleResponse(response);
};

export const uploadVideo = async (file: File, title: string, context: string, token: string) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('context', context);

    const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });
    return handleResponse(response);
};

export const updateVideo = async (id: number, title: string, context: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, context }),
    });
    return handleResponse(response);
};

export const fetchAdminStats = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};
