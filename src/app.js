// src/app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routers/users.router.js';
import PostsRouter from './routers/posts.router.js';
import logMiddleware from './middlewares/log.middleware.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import expressSession from 'express-session'
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "My API Information",
    },
    servers: [
      {
        url: "http://localhost:3018/api",
      },
    ],
  },
  apis: ["./src/routers/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions)
const app = express();
const PORT = 3018;

app.use(logMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use(expressSession({
  secret: process.env.ADMIN_KEY,
  resave: false,
  saveUninitialized: true,
}));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

app.use('/api', [UsersRouter, PostsRouter]);

app.use(errorHandlingMiddleware)
app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});