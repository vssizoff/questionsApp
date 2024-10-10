import axios from "axios";
import {ref, watch} from "vue";

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
    return data.data;
}