import express from "express";
import account from "./account.js";

const router = express.Router();

export default function routes(app) {
    router.use("/account", account);
    
    // metadata route
    router.get("/", (req, res) => {
        return res.json({ metadata: "Hello, World!" });
    });

    // set router as host:port/api
    app.use("/api", router);
}