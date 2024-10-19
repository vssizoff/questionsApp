import {buildHandlers} from "sbackend";
import {changeMessageStatus, editMessage, emitter, getMessages} from "./sql/messages.sql.js";
import {queue} from "./queue.js";

export default buildHandlers({
    get: {
        async "/admin/waiting"(request, response) {
            response.end(await getMessages(0));
        },
        async "/admin/accepted"(request, response) {
            response.end(await getMessages(1));
        },
        async "/admin/rejected"(request, response) {
            response.end(await getMessages(-1));
        }
    },
    patch: {
        async "/admin/edit"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.questionId !== "number" || typeof request.body.text !== "string" || typeof request.body.password !== "string") {
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
                await editMessage(request.body.text, request.body.questionId, true);
                response.end();
            } catch (error) {
                response.status(404);
                response.end();
            }
        },
        async "/admin/accept"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.id !== "number" || typeof request.body.password !== "string") {
                response.status(400);
                response.end();
                return;
            }
            if (request.body.password != "4.10.2024") {
                response.status(409);
                response.end();
                return;
            }
            await changeMessageStatus(request.body.id, 1);
            queue.push(request.body.id);
            response.end();
        },
        async "/admin/reject"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.id !== "number" || typeof request.body.password !== "string") {
                response.status(400);
                response.end();
                return;
            }
            if (request.body.password != "4.10.2024") {
                response.status(409);
                response.end();
                return;
            }
            await changeMessageStatus(request.body.id, -1);
            response.end();
        }
    },
    ws: {
        async "/admin"(request, response) {
            let connection = await response.accept();
            emitter.on("statusChange", message => connection.send(JSON.stringify({event: "statusChange", message})));
            emitter.on("adminEdit", message => connection.send(JSON.stringify({event: "adminEdit", message})));
            emitter.on("userSend", message => connection.send(JSON.stringify({event: "send", message})));
            emitter.on("userEdit", message => connection.send(JSON.stringify({event: "edit", message})));
        }
    }
});