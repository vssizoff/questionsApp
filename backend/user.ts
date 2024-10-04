import {buildHandlers} from "sbackend";
import {editMessage, emitter, getUserMessages, postMessage} from "./sql/messages.sql.js";
import {logIn} from "./sql/user.sql.js";

export default buildHandlers({
    get: {
        async "/user/messages/:userId"(request, response) {
            if (typeof request.params !== "object" || typeof request.params.userId !== "string") {
                response.status(400);
                response.end();
                return;
            }
            response.end(await getUserMessages(Number(request.params.userId)));
        }
    },
    post: {
        async "/user/log-in"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.username !== "string" || typeof request.body.class !== "string") {
                response.status(400);
                response.end();
                return;
            }
            response.end((await logIn(request.body.username, request.body.class)).toString());
        },
        async "/user/send"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.userId !== "number" || typeof request.body.text !== "string") {
                response.status(400);
                response.end();
                return;
            }
            try {
                response.end((await postMessage(request.body.text, request.body.userId)).toString());
            } catch (error) {
                response.status(409);
                response.end();
            }
        }
    },
    patch: {
        async "/user/edit"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.questionId !== "number" || typeof request.body.text !== "string") {
                response.status(400);
                response.end();
                return;
            }
            try {
                await editMessage(request.body.text, request.body.questionId);
                response.end();
            } catch (error) {
                response.status(404);
                response.end();
            }
        }
    },
    ws: {
        async "/user/:userId"(request, response) {
            if (typeof request.params !== "object" || typeof request.params.userId !== "string") {
                response.reject(409);
                return;
            }
            const connection = await response.accept(), userId = Number(request.params.userId);
            emitter.on("statusChange", message => {
                if (message.userId === userId) connection.send(JSON.stringify({event: "statusChange", message}));
            });
            emitter.on("adminEdit", message => {
                if (message.userId === userId) connection.send(JSON.stringify({event: "edit", message}));
            });
        }
    }
});