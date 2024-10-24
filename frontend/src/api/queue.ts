import {type MessageType, SERVER_BASE_URL, type TextType} from "@/api/index.js";
import axios from "axios";
import {adminPassword} from "@/api/admin.js";

export type QueueMessageType = MessageType & {text: TextType, used: boolean};

export async function getQueue(): Promise<Array<QueueMessageType>> {
    return (await axios.get<Array<QueueMessageType>>("/queue")).data;
}

export async function patchQueue(queue: Array<[number, boolean]>, password: string = adminPassword.value): Promise<void> {
    await axios.patch("/queue", {queue, password});
}

export async function popQueue(password: string = adminPassword.value): Promise<void> {
    await axios.delete("/queue?password=" + password);
}

export async function replaceElemInQueue(questionId: number, textId: number, text: string, password: string = adminPassword.value): Promise<void> {
    await axios.post("/queue", {questionId, textId, text, password});
}

export function subscribeQueue(changeHandler: (_: Array<QueueMessageType>) => void, pushHandler: (_: QueueMessageType) => void, popHandler: () => void, removeHandler: (_: number) => void, replaceHandler: (_: number, __: QueueMessageType) => void): () => void {
    let socket = new WebSocket(`${SERVER_BASE_URL}/queue/ws`);
    let closed = false, reconnected = false;
    socket.onmessage = (data) => {
        if (reconnected) return;
        let {event, ...other} = JSON.parse(data.data);
        if (event === "change") changeHandler(other.queue);
        if (event === "push") pushHandler(other.elem);
        if (event === "pop") popHandler();
        if (event === "remove") removeHandler(other.id);
        if (event === "replace") replaceHandler(other.from, other.to);
    };
    let close = () => {
        socket.close();
    };
    socket.onclose = () => {
        if (!closed && !reconnected) close = subscribeQueue(changeHandler, pushHandler, popHandler, removeHandler, replaceHandler);
        reconnected = true;
    };
    socket.onerror = () => {
        if (!closed && !reconnected) close = subscribeQueue(changeHandler, pushHandler, popHandler, removeHandler, replaceHandler);
        reconnected = true;
    };
    return () => {
        closed = true;
        close();
    };
}