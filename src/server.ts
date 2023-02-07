import app from './app'
import mongoose from 'mongoose';
import env from './utils/validateEnv'

const port = env.PORT

mongoose.connect(env.MONGO_CONNECTION).then(()=>{
    console.log('mongodb connected');
    app.listen(port, ()=>{
        console.log('server running at port ' + port);
    }) 
}).catch(console.error) 