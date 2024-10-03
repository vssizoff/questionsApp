import {db} from "./index.sql.js";
import {getUserId} from "./user.sql.js";

export async function postMessage(text: string, user: number | string): Promise<number> {
    if (typeof user === "string") {
        let id = await getUserId(user);
        if (!id) throw new Error("incorrect user");
        return postMessage(text, id);
    }
    let userId: number = user;
    let {id: questionId} = await db.insertInto("questions").values({userId}).returning(["id"]).executeTakeFirstOrThrow();
    await db.insertInto("texts").values({questionId, text, number: 0}).execute();
    return questionId;
}

export async function editMessage(text: string, questionId: number): Promise<void> {
    let {count} = await db.selectFrom("questions").where("id", '=', questionId).select(["count"]).executeTakeFirstOrThrow();
    await db.updateTable("questions").where("id", '=', questionId).set({count: count + 1}).execute();
    await db.updateTable("texts").set({status: 2}).where(({and, eb}) => and([eb("questionId", '=', questionId), eb("status", '=', 1)])).execute();
    await db.updateTable("texts").set({status: -2}).where(({and, eb}) => and([eb("questionId", '=', questionId), eb("status", '=', -1)])).execute();
    await db.insertInto("texts").values({questionId, text, number: count}).execute();
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

export async function getMessage(id: number): Promise<MessageType> {
    let {userId} = await db.selectFrom("questions").where("id", '=', id).select(["userId"]).executeTakeFirstOrThrow();
    let texts = await db.selectFrom("texts").where("questionId", '=', id).select(["id", "text", "status"]).execute();
    return {id, userId, texts};
}

export async function getUserMessages(userId: number): Promise<Array<MessageType>> {
    return Promise.all((await db.selectFrom("questions").where("userId", '=', userId).select(["id"]).execute()).map(({id}) => getMessage(id)));
}