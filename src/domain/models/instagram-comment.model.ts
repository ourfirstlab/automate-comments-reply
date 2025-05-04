export interface InstagramComment {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    postId: string;
}

export interface InstagramWebhookEntry {
    changes: {
        value: {
            id: string;
            text: string;
            from: {
                id: string;
                username: string;
            };
            created_time: string;
            post_id: string;
            parent_id?: string;
        };
        field: string;
    }[];
    id: string;
    time: number;
} 