import {db} from "./index.sql.js";

export default async function () {
    try {
        await db.schema.createTable("users")
            .addColumn("id", "serial", cb => cb.primaryKey().unique())
            .addColumn("username", "varchar(50)", cb => cb.notNull())
            .addColumn("class", "varchar(50)").execute();
    } catch (error) {}
    try {
        await db.schema.createTable("questions")
            .addColumn("id", "serial", cb => cb.primaryKey().unique())
            .addColumn("userId", "integer", cb => cb.notNull().references("users.id"))
            .addColumn("count", "integer", cb => cb.notNull().defaultTo(1)).execute();
    } catch (error) {}
    try {
        await db.schema.createTable("texts")
            .addColumn("id", "serial", cb => cb.primaryKey().unique())
            .addColumn("questionId", "integer", cb => cb.notNull().references("questions.id"))
            .addColumn("text", "text", cb => cb.notNull())
            .addColumn("status", "integer", cb => cb.notNull().defaultTo(0))
            .addColumn("number", "integer", cb => cb.notNull()).execute();
    } catch (error) {}
}