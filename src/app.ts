// app.ts (descripción, no código final del proyecto)
import express, { Express } from "express";

const app: Express = express();

app.use(express.json());

export default app;