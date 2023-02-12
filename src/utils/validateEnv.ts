import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env,{
    MONGO_CONNECTION: str(),
    PORT: port(),
    JWT_SECRET: str(),
    NODE_EMAIL:str(),
    NODE_PASSWORD : str(),
    
}) 