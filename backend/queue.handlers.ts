import {buildHandlers} from "sbackend";
import {queue} from "./queue.js";
import {editMessage, getByTextId} from "./sql/messages.sql.js";

export default buildHandlers({
    get: {
        async "/queue"(request, response) {
            response.end(await Promise.all(queue.array.map(async ([id, used]) => ({...await getByTextId(id), used}))));
        }
    },
    post: {
        async "/queue"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.questionId !== "number" || typeof request.body.textId !== "number" || typeof request.body.text !== "string" || typeof request.body.password !== "string") {
                response.status(400);
                response.end();
                return;
            }
            if (request.body.password != "4.10.2024") {
                response.status(409);
                response.end();
                return;
            }
            try {
                queue.replace(request.body.textId, await editMessage(request.body.text, request.body.questionId, true));
                response.end();
            } catch (error) {
                response.status(404);
                response.end();
            }
        }
    },
    patch: {
        "/queue"(request, response) {
            if (typeof request.body != "object" || typeof request.body.queue != "object" || !Array.isArray(request.body.queue) || typeof request.body.password != "string") {
                response.status(400);
                response.end();
                return;
            }
            if (request.body.password != "4.10.2024") {
                response.status(409);
                response.end();
                return;
            }
            queue.array = request.body.queue;
            response.end();
        }
    },
    delete: {
        "/queue"(request, response) {
            if (typeof request.query.password != "string") {
                response.status(400);
                response.end();
                return;
            }
            if (request.query.password != "4.10.2024") {
                response.status(409);
                response.end();
                return;
            }
            queue.pop();
            response.end();
        }
    },
    ws: {
        async "/queue/ws"(request, response) {
            let connection = await response.accept();
            queue.eventEmitter.on("change", async (queue) => {
                connection.send(JSON.stringify({
                    event: "change",
                    queue: await Promise.all(queue.array.map(async ([id, used]) => ({...await getByTextId(id), used})))
                }));
            });
            queue.eventEmitter.on("push", async (id) => connection.send(JSON.stringify({event: "push", elem: await getByTextId(id)})));
            queue.eventEmitter.on("pop", () => connection.send(JSON.stringify({event: "pop"})));
            queue.eventEmitter.on("remove", (id) => connection.send(JSON.stringify({event: "remove", id})));
            queue.eventEmitter.on("replace", async ([from, to]) => connection.send(JSON.stringify({event: "replace", from, to: await getByTextId(to)})));
        }
    }
});