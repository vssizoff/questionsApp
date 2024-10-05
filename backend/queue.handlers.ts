import {buildHandlers} from "sbackend";
import {queue} from "./queue.js";

export default buildHandlers({
    get: {
        "/queue"(request, response) {
            response.end(queue.array);
        }
    },
    post: {
        "/queue"(request, response) {
            if (typeof request.body != "object" || typeof request.body.elem != "number" && typeof request.body.elem != "string" || typeof request.body.password != "string") {
                response.status(400);
                response.end();
                return;
            }
            if (request.body.password != "4.10.2024") {
                response.status(409);
                response.end();
                return;
            }
            queue.push(Number(request.body.elem));
            response.end();
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
    ws: {
        async "/queue/ws"(request, response) {
            let connection = await response.accept();
            queue.eventEmitter.on("change", (queue) => connection.send(JSON.stringify({queue: queue.array})));
            queue.eventEmitter.on("push", (value) => connection.send(JSON.stringify({push: value})));
            queue.eventEmitter.on("pop", (value) => connection.send(JSON.stringify({pop: value})));
        }
    }
});