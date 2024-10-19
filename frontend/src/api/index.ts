export const SERVER_BASE_URL = "http://localhost:80/api";

export type TextType = {
    id: number,
    text: string,
    status: number
}

export type MessageType = {
    id: number,
    user: {
        id: number,
        username: string,
        class: string
    },
    texts: Array<TextType>;
};