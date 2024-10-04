import setupDB from "./setup.sql.js";
import {ColumnType, Generated, Kysely, PostgresDialect} from "kysely";
import pg from "pg";

export interface UsersTable {
    id: Generated<number>;
    username: string;
    class: string;
}

export interface QuestionsTable {
    id : Generated<number>;
    userId: number;
    count: ColumnType<number, number | undefined, number>;
}

export interface TextsTable {
    id: Generated<number>;
    questionId: number;
    text: string;
    status: ColumnType<-2 | -1 | 0 | 1 | 2, -2 | -1 | 0 | 1 | 2 | undefined, -2 | -1 | 0 | 1 | 2>;
    number: number;
}

export interface Database {
    users: UsersTable;
    questions: QuestionsTable;
    texts: TextsTable;
}

export let pool: pg.Pool, dialect: PostgresDialect, db: Kysely<Database>;

export function connect(host: string, port: number, user: string, password: string, database: string) {
    pool = new pg.Pool({host, port, user, password, database});
    dialect = new PostgresDialect({pool});
    db = new Kysely<Database>({dialect});
}

export async function setup(host: string, port: number, user: string, password: string, database: string) {
    connect(host, port, user, password, database);
    await setupDB();
}

export async function setupEnv() {
    await setup(process.env.DB_HOST ?? "localhost", Number(process.env.DB_PORT ?? 5432), process.env.DB_USER ?? "postgres", process.env.DB_PASSWORD ?? "", process.env.DB_NAME ?? "postgres");
}