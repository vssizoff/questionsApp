import {type MessageType, SERVER_BASE_URL, type TextType} from "@/api/index.js";
import axios from "axios";
import {adminPassword} from "@/api/admin.js";

export async function getQueue(): Promise<Array<MessageType & {text: TextType, used: boolean}>> {
    return (await axios.get<Array<MessageType & {text: TextType, used: boolean}>>("/queue")).data;
}

export async function patchQueue(queue: Array<[number, boolean]>, password: string = adminPassword.value): Promise<void> {
    await axios.patch("/queue", {queue, password});
}

export async function popQueue(password: string = adminPassword.value): Promise<void> {
    await axios.delete("/queue?password=" + password);
}

export function subscribeQueue(changeHandler: (_: Array<MessageType & {text: TextType}>) => void, pushHandler: (_: number) => void, popHandler: (_: number) => void, removeHandler: (_: number) => void): () => void {
    let socket = new WebSocket(`${SERVER_BASE_URL}/admin`);
    socket.onmessage = (data) => {
        let {event, ...other} = JSON.parse(data.data);
        if (event === "change") changeHandler(other.queue);
        if (event === "push") pushHandler(other.index);
        if (event === "pop") popHandler(other.index);
        if (event === "remove") removeHandler(other.id);
    };
    let closed = false;
    let close = () => {
        socket.close();
    };
    socket.onclose = () => {
        if (!closed) close = subscribeQueue(changeHandler, pushHandler, popHandler, removeHandler);
    };
    socket.onerror = () => {
        if (!closed) close = subscribeQueue(changeHandler, pushHandler, popHandler, removeHandler);
    };
    return () => {
        closed = true;
        close();
    };
}