import axios from "axios";
import {ref, watch} from "vue";
// import WebSocket from "@vite/vitejs-ws";
import {SERVER_BASE_URL} from "@/api/serverConfig.js";

export const userId = ref<number>(Number(localStorage.getItem("userId") ?? -1));
watch(userId, () => {
    localStorage.setItem("userId", String(userId.value));
});

export async function logIn(username: string, class_: string): Promise<void> {
    let data = await axios.post<number>("/user/log-in", {username, class: class_});
    userId.value = data.data;
}

export type MessageType = {
    id: number,
    userId: number,
    texts: Array<{
        id: number,
        text: string,
        status: number
    }>;
};

export async function getMessages(userID: number = userId.value): Promise<Array<MessageType>> {
    let data = await axios.get<Array<MessageType>>(`/user/messages/${userID}`);
    return data.data.sort((a: MessageType, b: MessageType) => a.id - b.id);
}

export async function sendMessage(text: string, userID: number = userId.value): Promise<number> {
    let data = await axios.post<number>("/user/send", {userId: userID, text});
    return data.status === 200 ? data.data : -1;
}

export async function editMessage(questionId: number, text: string): Promise<boolean> {
    let data = await axios.patch<void>("/user/edit", {questionId, text});
    return data.status === 200;
}

export function subscribeUser(statusChangeHandler: (_: MessageType) => void, adminEditHandler: (_: MessageType) => void, userID: number = userId.value): () => void {
    let socket = new WebSocket(`${SERVER_BASE_URL}/user/${userID}`);
    socket.onmessage = (data) => {
        let {event, message} = JSON.parse(data.data);
        console.log(JSON.parse(data.data))
        if (event === "statusChange") statusChangeHandler(message);
        if (event === "edit") adminEditHandler(message);
    };
    return () => {
        socket.close();
    };
}