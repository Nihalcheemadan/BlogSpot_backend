import 'dotenv/config'
import express, { NextFunction, Request, Response }  from "express";
import userRouter from './routes/userRoute'
import adminRouter from './routes/adminRoute'
import blogRoute from './routes/blogRoute'
import createHttpError , {isHttpError} from 'http-errors';
import { Server as SocketIOServer, Socket } from 'socket.io';
import morgan from 'morgan'
import http from 'http';
import cors from 'cors'
import mongoose from 'mongoose';
import env from './utils/validateEnv'


const app = express();
const server = http.createServer(app);

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

app.use(express.json());
app.use(morgan('dev')); 
app.use(cors())

app.use("/api/user",userRouter);
app.use("/api/admin",adminRouter);
app.use('/api/blog',blogRoute)

app.use((req,res,next)=>{
    next(createHttpError(404,"Endpoint not found"));
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error:unknown,req:Request,res:Response,next:NextFunction)=>{
    console.log(error);
    let errorMessage = "An unknown error occured"
    let statusCode = 500;
    if(isHttpError(error)){
        statusCode = error.status;
        errorMessage = error.message;
    }
    res.status(statusCode).json({error : errorMessage})
})


const io = new SocketIOServer(server, {
    cors: {
        origin:'http://localhost:3000/',
        credentials: true
    } 
});

const onlineUsers = new Map();
io.on("connection", (socket) => { 
    console.log('Client connected:', socket.id);
    // const chatSocket = socket;
    socket.on("addUser", (id) => {
        onlineUsers.set(id, socket.id);
    })
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message)
        }
    })
    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
})

const port = env.PORT

mongoose.connect(env.MONGO_CONNECTION).then(()=>{
    console.log('mongodb connected');
    server.listen(port, ()=>{
        console.log('server running at port ' + port);
    }) 
}).catch(console.error)

export default app; 