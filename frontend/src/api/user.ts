import axios from "axios";
import {ref, watch} from "vue";
import {type MessageType, SERVER_BASE_URL} from "@/api/index.js";

export const userId = ref<number>(Number(localStorage.getItem("userId") ?? -1));
watch(userId, () => {
    localStorage.setItem("userId", String(userId.value));
});
export const user = ref<{id: number, username: string, class: string}>(JSON.parse(localStorage.getItem("user") ?? "{}"));
watch(user, () => {
    localStorage.setItem("user", JSON.stringify(user.value));
});

export async function logIn(username: string, class_: string): Promise<void> {
    let data = await axios.post<number>("/user/log-in", {username, class: class_});
    userId.value = data.data;
    user.value = {id: data.data, username, class: class_};
}

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
        if (event === "statusChange") statusChangeHandler(message);
        if (event === "edit") adminEditHandler(message);
    };
    let closed = false;
    let close = () => {
        socket.close();
    };
    socket.onclose = () => {
        if (!closed) close = subscribeUser(statusChangeHandler, adminEditHandler, userID);
    };
    socket.onerror = () => {
        if (!closed) close = subscribeUser(statusChangeHandler, adminEditHandler, userID);
    };
    return () => {
        closed = true;
        close();
    };
}