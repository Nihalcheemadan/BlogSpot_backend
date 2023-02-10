import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env,{
    MONGO_CONNECTION: str(),
    PORT: port(),
    JWT_SECRET: str(),
    NODE_EMAIL:str(),
    NODE_PASSWORD : str(),
    CLOUDINARY_NAME : str(),
    CLOUDINARY_API_KEY : str(),
    CLOUDINARY_SECRET_KEY : str()
}) 