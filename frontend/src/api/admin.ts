import type {MessageType} from "@/api/index.js";
import axios from "axios";
import {ref, watch} from "vue";

export const adminPassword = ref<string>(localStorage.getItem("adminPassword") ?? "");
watch(adminPassword, () => {
    localStorage.setItem("adminPassword", adminPassword.value);
});

export async function getWaitingMessages(): Promise<Array<MessageType>> {
    let data = await axios.get<Array<MessageType>>("/admin/waiting");
    return data.data.sort((a: MessageType, b: MessageType) => a.id - b.id);
}

export async function getAcceptedMessages(): Promise<Array<MessageType>> {
    let data = await axios.get<Array<MessageType>>("/admin/accepted");
    return data.data.sort((a: MessageType, b: MessageType) => a.id - b.id);
}

export async function getRejectedMessages(): Promise<Array<MessageType>> {
    let data = await axios.get<Array<MessageType>>("/admin/rejected");
    return data.data.sort((a: MessageType, b: MessageType) => a.id - b.id);
}

export async function editMessage(questionId: number, text: string, password: string = adminPassword.value): Promise<boolean> {
    let data = await axios.patch<void>("/admin/edit", {questionId, text, password});
    return data.status === 200;
}

export async function acceptMessage(id: number, password: string = adminPassword.value): Promise<boolean> {
    let data = await axios.patch<void>("/admin/accept", {id, password});
    return data.status === 200;
}

export async function rejectMessage(id: number, password: string = adminPassword.value): Promise<boolean> {
    let data = await axios.patch<void>("/admin/accept", {id, password});
    return data.status === 200;
}