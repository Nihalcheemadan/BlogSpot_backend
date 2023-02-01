import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env,{
    MONGO_CONNECTION: str(),
    PORT: port()
})