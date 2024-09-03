import mongoose from 'mongoose'

export default async function dbConnection(){
    try{
        await mongoose.connect(process.env.MONGO_CNN)
        console.log('conectado a la base de datos')
    }catch (error){
        console.log(error)
    }
}