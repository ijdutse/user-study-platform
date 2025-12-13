export interface Video {
    id: number;
    filename: string;
    title: string;
    context: string;
}

export interface Rating {
    video_id: number;
    participant_id: string;
    accuracy: number;
    bias: number;
    representativeness: number;
    stereotypes: number;
    comments: string;
}
