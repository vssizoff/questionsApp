import {buildHandlers} from "sbackend";
import {editMessage, logIn, postMessage} from "./sql/user.sql.js";

export default buildHandlers({
    get: {
        async "/log-in"(request, response) {
            if (typeof request.body !== "object" || typeof request.body.username !== "string" || typeof request.body.class !== "string") {
                response.status(400);
                response.end();
                return;
            }
            response.end((await logIn(request.body.username, request.body.class)).toString());
        }
    },
    post: {
        async "/user/message"(request, response) {
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
        },
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
        async "/user"(request, response) {
            let connection = await response.accept();
            connection.on("message", data => {
                console.log(data);
            });
        }
    }
});