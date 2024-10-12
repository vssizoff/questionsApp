export const SERVER_BASE_URL = "http://localhost:80/api";

export type MessageType = {
    id: number,
    userId: number,
    texts: Array<{
        id: number,
        text: string,
        status: number
    }>;
};