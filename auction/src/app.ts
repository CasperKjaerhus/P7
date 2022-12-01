// Import the express in typescript file
import express, { json, urlencoded, Response as ExResponse, Request as ExRequest } from 'express';
import { RegisterRoutes } from '../build/routes'

import swaggerUi from "swagger-ui-express";

export const app = express();

// tsoa
// Use body parser to read sent json payloads
app.use(
    urlencoded({
        extended: true,
    })
);
app.use(json());

// Swagger 
app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
    return res.send(
        swaggerUi.generateHTML(await import("../build/swagger.json"))
    );
});


RegisterRoutes(app);

