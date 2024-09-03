import Celda from '../models/celda.js';
import bcrypt from 'bcryptjs';

// Método para registrar una nueva celda
export async function registrarCelda(req, res) {
    try {
        const celdaCount = await Celda.countDocuments();
        if (celdaCount >= 10) {  // Ajusta este límite según las necesidades futuras
            return res.status(400).json('Límite de celdas alcanzado');
        }

        const newCelda = new Celda(req.body);
        await newCelda.save();
        res.status(201).json('Celda creada con éxito');
    } catch (error) {
        res.status(500).json('Error al crear la celda');
    }
}

// Método para parquear un vehículo
export async function parquearVehiculo(req, res) {
    const { placaVehiculo } = req.body;

    try {
        const celdaDisponible = await Celda.findOne({ estado: 'disponible' });

        if (!celdaDisponible) {
            return res.status(404).json('No hay celdas disponibles');
        }

        celdaDisponible.placaVehiculo = placaVehiculo;
        celdaDisponible.estado = 'no disponible';
        celdaDisponible.fechaIngreso = new Date();

        const pinRaw = `${celdaDisponible.numeroCelda}${placaVehiculo}`;
        const salt = await bcrypt.genSalt(10);
        celdaDisponible.pin = await bcrypt.hash(pinRaw, salt);

        await celdaDisponible.save();
        res.status(200).json('Vehículo parqueado con éxito');
    } catch (error) {
        res.status(500).json('Error al parquear el vehículo');
    }
}

// Método para calcular el valor a pagar
export async function calcularValor(req, res) {
    const { id } = req.params;

    try {
        const celda = await Celda.findById(id);

        if (!celda || celda.estado === 'disponible') {
            return res.status(404).json('Celda no ocupada o no encontrada');
        }

        const fechaIngreso = celda.fechaIngreso;
        const fechaSalida = new Date();
        celda.fechaSalida = fechaSalida;

        const horas = Math.max(1, Math.floor((fechaSalida - fechaIngreso) / (1000 * 60 * 60)));
        const valor = horas * 5000;

        res.status(200).json({ valor, horas });

    } catch (error) {
        res.status(500).json('Error al calcular el valor a pagar');
    }
}

// Método para salir y liberar la celda
export async function liberarCelda(req, res) {
    const { id } = req.params;

    try {
        const celda = await Celda.findById(id);

        if (!celda || celda.estado === 'disponible') {
            return res.status(404).json('Celda no ocupada o no encontrada');
        }

        celda.estado = 'disponible';
        celda.placaVehiculo = '';
        celda.fechaIngreso = null;
        celda.fechaSalida = null;
        celda.pin = '';

        await celda.save();
        res.status(200).json('Vehículo salido y celda liberada');

    } catch (error) {
        res.status(500).json('Error al liberar la celda');
    }
}

// Método para obtener una celda específica por su ID
export async function obtenerCelda(req, res) {
    const { id } = req.params;

    try {
        const celda = await Celda.findById(id);

        if (!celda) {
            return res.status(404).json('Celda no encontrada');
        }

        res.status(200).json(celda);
    } catch (error) {
        res.status(500).json('Error al obtener la celda');
    }
}

// Método para obtener todas las celdas
export async function obtenerTodasLasCeldas(req, res) {
    try {
        const celdas = await Celda.find();
        res.status(200).json(celdas);
    } catch (error) {
        res.status(500).json('Error al obtener las celdas');
    }
}

// Método para obtener todas las celdas con estado "disponible"
export async function obtenerCeldasDisponibles(req, res) {
    try {
        const celdasDisponibles = await Celda.find({ estado: 'disponible' });
        res.status(200).json(celdasDisponibles);
    } catch (error) {
        res.status(500).json('Error al obtener las celdas disponibles');
    }
}

// Método para actualizar una celda específica por su ID
export async function actualizarCelda(req, res) {
    const { id } = req.params;
    const { numeroCelda, estado, placaVehiculo, fechaIngreso, fechaSalida, pin } = req.body;

    try {
        const celda = await Celda.findByIdAndUpdate(
            id,
            { numeroCelda, estado, placaVehiculo, fechaIngreso, fechaSalida, pin },
            { new: true }
        );

        if (!celda) {
            return res.status(404).json('Celda no encontrada');
        }

        res.status(200).json('Celda actualizada con éxito');
    } catch (error) {
        res.status(500).json('Error al actualizar la celda');
    }
}

// Método para eliminar una celda específica por su ID
export async function eliminarCelda(req, res) {
    const { id } = req.params;

    try {
        const celda = await Celda.findByIdAndDelete(id);

        if (!celda) {
            return res.status(404).json('Celda no encontrada');
        }

        res.status(200).json('Celda eliminada con éxito');
    } catch (error) {
        res.status(500).json('Error al eliminar la celda');
    }
}
