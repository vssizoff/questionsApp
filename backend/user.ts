import {buildHandlers} from "sbackend";
import {logIn} from "./sql/user.sql.js";

export default buildHandlers({
    get: {
        async "/log-in"(request, response) {
            if (typeof request.body !== "object" || !("username" in request.body) || !("class" in request.body)) {
                response.status(400);
                response.end();
                return;
            }
            await logIn(request.body.username, request.body.class);
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