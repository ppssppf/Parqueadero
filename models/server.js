import express from 'express';
import "dotenv/config";
import dbConnection from "../database/config.js";
import { 
    registrarCelda,
    parquearVehiculo,
    calcularValor,
    liberarCelda,
    obtenerCelda,
    obtenerTodasLasCeldas,
    obtenerCeldasDisponibles,
    actualizarCelda,
    eliminarCelda
} from '../controllers/celdaController.js';

export default class Server {
    constructor() {
        this.app = express();
        this.listen();
        this.dbConnect();
        this.pathCelda = "/api/celdas"; // Ruta base para celdas
        this.routes();
    }

    listen() { // Método para escuchar el puerto
        this.app.listen(process.env.PORT, () => {
            console.log(`El servidor está corriendo en ${process.env.PORT}`);
        });
    }

    async dbConnect() { // Llamada al método dbConnection para conectarse a MongoDB
        await dbConnection();
    }

    routes() {
        this.app.use(express.json());

        // Rutas para las celdas
        this.app.post(this.pathCelda, registrarCelda); // Crear una nueva celda
        this.app.post(this.pathCelda + '/parquear', parquearVehiculo); // Parquear un vehículo
        this.app.get(this.pathCelda + '/:id/valor', calcularValor); // Calcular valor a pagar
        this.app.post(this.pathCelda + '/:id/salir', liberarCelda); // Liberar celda y salir
        this.app.get(this.pathCelda + '/:id', obtenerCelda); // Obtener una celda específica
        this.app.get(this.pathCelda, obtenerTodasLasCeldas); // Obtener todas las celdas
        this.app.get(this.pathCelda + '/estado/disponible', obtenerCeldasDisponibles); // Obtener celdas disponibles
        this.app.put(this.pathCelda + '/:id', actualizarCelda); // Actualizar una celda específica
        this.app.delete(this.pathCelda + '/:id', eliminarCelda); // Eliminar una celda específica
    }
}
