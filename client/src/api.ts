import type { Video, Rating } from './types';
import { API_URL } from './config';

export const fetchVideos = async (): Promise<Video[]> => {
    const response = await fetch(`${API_URL}/videos`);
    if (!response.ok) {
        throw new Error('Failed to fetch videos');
    }
    const data = await response.json();
    return data.data;
};

export const submitRating = async (rating: Rating) => {
    const response = await fetch(`${API_URL}/ratings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rating),
    });
    if (!response.ok) {
        throw new Error('Failed to submit rating');
    }
    return response.json();
};

export const submitDemographics = async (data: any) => {
    const response = await fetch(`${API_URL}/participants`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to submit demographics');
    }
    return response.json();
};

export const submitAttentionCheck = async (id: string, score: number) => {
    const response = await fetch(`${API_URL}/participants/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attention_check: score }),
    });
    if (!response.ok) {
        throw new Error('Failed to submit attention check');
    }
    return response.json();
};

export const submitDebrief = async (id: string, feedback: string, compensationId: string) => {
    const response = await fetch(`${API_URL}/participants/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            qualitative_feedback: feedback,
            compensation_id: compensationId
        }),
    });
    if (!response.ok) {
        throw new Error('Failed to submit debrief');
    }
    return response.json();
};
