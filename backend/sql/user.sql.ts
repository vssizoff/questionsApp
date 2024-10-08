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