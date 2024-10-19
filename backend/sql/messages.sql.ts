import {db} from "./index.sql.js";
import {getUserId} from "./user.sql.js";
import {EventEmitter} from "event-emitter-typescript";

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

export type Events = {
    userSend: MessageType;
    userEdit: MessageType;
    adminEdit: MessageType;
    statusChange: MessageType;
}

export const emitter = new EventEmitter<Events>;

export async function getMessage(id: number): Promise<MessageType> {
    let {userId} = await db.selectFrom("questions").where("id", '=', id).select(["userId"]).executeTakeFirstOrThrow();
    let texts = await db.selectFrom("texts").where("questionId", '=', id).select(["id", "text", "status"]).orderBy("number", "asc").execute();
    return {id, user: await db.selectFrom("users").where("id", '=', userId).selectAll().executeTakeFirstOrThrow(), texts};
}

export async function postMessage(text: string, user: number | string): Promise<number> {
    if (typeof user === "string") {
        let id = await getUserId(user);
        if (!id) throw new Error("incorrect user");
        return postMessage(text, id);
    }
    let userId: number = user;
    let {id: questionId} = await db.insertInto("questions").values({userId}).returning(["id"]).executeTakeFirstOrThrow();
    await db.insertInto("texts").values({questionId, text, number: 0}).execute();
    getMessage(questionId).then(message => emitter.emit("userSend", message));
    return questionId;
}

export async function editMessage(text: string, questionId: number, isAdmin = false): Promise<void> {
    let {count} = await db.selectFrom("questions").where("id", '=', questionId).select(["count"]).executeTakeFirstOrThrow();
    await db.updateTable("questions").where("id", '=', questionId).set({count: count + 1}).execute();
    await db.updateTable("texts").set({status: 2}).where(({and, eb}) => and([eb("questionId", '=', questionId), eb("status", '=', 1)])).execute();
    await db.updateTable("texts").set({status: -2}).where(({and, eb}) => and([eb("questionId", '=', questionId), eb("status", '=', -1)])).execute();
    await db.insertInto("texts").values({questionId, text, number: count, status: isAdmin ? 1 : 0}).execute();
    getMessage(questionId).then(message => emitter.emit(isAdmin ? "adminEdit" : "userEdit", message));
}

export async function getUserMessages(userId: number): Promise<Array<MessageType>> {
    return Promise.all((await db.selectFrom("questions").where("userId", '=', userId).select(["id"]).execute()).map(({id}) => getMessage(id)));
}

export async function getMessages(status: -2 | -1 | 0 | 1 | 2): Promise<Array<MessageType>> {
    let textIds = Array.from(new Set((await db.selectFrom("texts").where("status", '=', status).select("questionId").execute()).map(({questionId}) => questionId)));
    return Promise.all(textIds.map(questionId => getMessage(questionId)));
}

export async function changeMessageStatus(id: number, status: -2 | -1 | 0 | 1 | 2): Promise<void> {
    let {questionId} = await db.updateTable("texts").where("id", '=', id).set({status}).returning(["questionId"]).executeTakeFirst() ?? {};
    if (questionId) getMessage(questionId).then(message => emitter.emit("statusChange", message));
}

export async function getByTextId(id: number): Promise<MessageType & {text: TextType}> {
    let {text, status, questionId} = await db.selectFrom("texts").where("id", '=', id).select(["text", "status", "questionId"]).executeTakeFirstOrThrow();
    return {...await getMessage(questionId), text: {id, text, status}};
}