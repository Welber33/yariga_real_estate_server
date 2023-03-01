import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./mongodb/connect.js";
import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (request, response) => {
  response.send({ message: 'Hello World' });
})

app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter)

async function startServer() {
  try {
    connectDB(process.env.MONGODB_URL)

    app.listen(8080, () => console.log('Server started listen on port http://localhost:8080'))
  } catch (error) {
    console.log(error)
  }
} 

startServer()