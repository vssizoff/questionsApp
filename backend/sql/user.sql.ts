import {db} from "./index.sql.js";

export async function getUserId(username: string): Promise<number | undefined> {
    let {id} = (await db.selectFrom("users").where("username", '=', username).select(["id"]).executeTakeFirst()) ?? {};
    return id;
}

export async function logIn(username: string, class_: string): Promise<number> {
    let user = await db.selectFrom("users").where(({and, eb}) => and([eb("username", '=', username), eb("class", '=', class_)])).select(["id"]).executeTakeFirst();
    if (user) return user.id;
    await db.insertInto("users").values({username, class: class_}).execute();
    user = await db.selectFrom("users").where(({and, eb}) => and([eb("username", '=', username), eb("class", '=', class_)])).select(["id"]).executeTakeFirst();
    if (user) return user.id;
    return 0;
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
    return questionId;
}

export async function editMessage(text: string, questionId: number): Promise<void> {
    let {count} = await db.selectFrom("questions").where("id", '=', questionId).select(["count"]).executeTakeFirstOrThrow();
    await db.updateTable("questions").where("id", '=', questionId).set({count: count + 1}).execute();
    await db.updateTable("texts").set({status: 2}).where(({and, eb}) => and([eb("questionId", '=', questionId), eb("status", '=', 1)])).execute();
    await db.updateTable("texts").set({status: -2}).where(({and, eb}) => and([eb("questionId", '=', questionId), eb("status", '=', -1)])).execute();
    await db.insertInto("texts").values({questionId, text, number: count}).execute();
}