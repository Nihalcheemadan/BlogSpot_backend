import 'dotenv/config'
import express, { NextFunction, Request, Response }  from "express";
import userRouter from './routes/userRoute'
import adminRouter from './routes/adminRoute'
import createHttpError , {isHttpError} from 'http-errors';

const app = express();

app.use(express.json());

app.use("/api/user",userRouter)
app.use("/api/admin",adminRouter)


app.use((req,res,next)=>{
    next(createHttpError(404,"Endpoint not found"))
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
    res.sendStatus(statusCode).json({error : errorMessage})
})

export default app;