import express, { json } from "express";
import { logRequest } from "./middlewares/requests-logger";
import mainRouter from "./routes";
import { handle404Error } from "./middlewares/wrong-url-handler";
import cookieParser from "cookie-parser";

const app = express();

app.use(json());
app.use(cookieParser());
//app.use(logRequest)

app.use("/v1/api", mainRouter);

app.use("*", handle404Error);
export default app;
