import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors'; 
import routes from './Routes/routes';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3030;


app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json());

app.use('/', routes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
