// Import the express in typescript file
import express, { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';
import { Get, Route } from 'tsoa';
import auction from './auction.ts';
// Initialize the express engine
const app: express.Application = express();
const router: express.Router = express.Router();

app.use(router);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Handling '/' Request
app.get('/', (_req, _res) => {
    auction.
    _res.send("TypeScript With Express, does this work?");
});

// Take a port 3000 for running server.
const port: number = 3000;

// Server setup
app.listen(port, () => {
    console.log(`TypeScript with Express
         http://localhost:${port}/`);
});
