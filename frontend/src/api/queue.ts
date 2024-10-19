import type {MessageType, TextType} from "@/api/index.js";
import axios from "axios";

export async function getQueue(): Promise<Array<MessageType & {text: TextType}>> {
    return (await axios.get<Array<MessageType & {text: TextType}>>("/queue")).data;
}