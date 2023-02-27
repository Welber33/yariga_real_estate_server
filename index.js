import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './mongodb/connect.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (request, response) => {
  response.send({ message: 'Hello World' });
})

async function startServer() {
  try {
    connectDB(process.env.MONGODB_URL)

    app.listen(8080, () => console.log('Server started listen on port http://localhost:8080'))
  } catch (error) {
    console.log(error)
  }
} 

startServer()