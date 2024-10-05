import "dotenv/config";
import SBackend from "sbackend";
import {setupEnv} from "./sql/index.sql.js";
import user from "./user.handlers.js";
import admin from "./admin.handlers.js";
import queueHandlers from "./queue.handlers.js";

async function main() {
    await setupEnv();

    const app = new SBackend({
        name: "test",
        version: "0.0.0",
        logPath: "./latest.log",
        host: process.env.HOST,
        port: process.env.PORT
    });

    app.use("*", (request, response, next) => {
        response.headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*"
        };
        next();
    });

    app.addHandlers(user);
    app.addHandlers(admin);
    app.addHandlers(queueHandlers);

    app.get("/teapot", (request, response) => {
        response.status(418);
        response.end("This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol, and is not expected to be implemented by actual HTTP servers. However, known implementations do exist.");
    });

    app.options("*", (request, response) => {
        response.end();
    });

    app.use("*", (request, response) => {
        response.status(404);
        response.end("404 Not Found");
    });

    app.start(async () => {
        console.log(app.routes);
    });
}

main();