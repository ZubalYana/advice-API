import express from "express";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ message: "TypeScript + Express server here" });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT} (env: ${process.env.NODE_ENV ?? "dev"})`);
});