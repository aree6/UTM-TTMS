import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import "reflect-metadata";
import "./dependencies/register";
import "./controllers";
import { createRouter } from "./router";
import cors from "cors";

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(cookieParser(process.env.COOKIE_SECRET))
    .use(createRouter());

const port = parseInt(process.env.PORT ?? "3001");
app.listen(port, (err) => {
    if (err) {
        throw err;
    }

    console.log(`Server is running on port ${port}`);
});
