import mongoose, { model, Schema } from 'mongoose'; // Importa mongoose completo
import autoIncrement from 'mongoose-sequence'; // Importa mongoose-sequence
import bcrypt from 'bcryptjs';

// Configuración de auto-incremento pasando mongoose
const AutoIncrement = autoIncrement(mongoose); // Pasa mongoose como argumento

// Define el esquema de la celda
const CeldaSchema = new Schema({
  numeroCelda: {
    type: Number,
    unique: true,
    required: true,
    default: 0
  },
  estado: {
    type: String,
    enum: ['disponible', 'no disponible'],
    default: 'disponible'
  },
  placaVehiculo: {
    type: String,
    maxlength: 6,
    default: ''
  },
  fechaIngreso: {
    type: Date,
    default: Date.now
  },
  fechaSalida: {
    type: Date
  },
  pin: {
    type: String,
    default: ''
  }
});

// Aplicar el plugin de auto-incremento a CeldaSchema
CeldaSchema.plugin(AutoIncrement, {
  inc_field: 'numeroCelda',
  start_seq: 1
});

// Hook pre-save para encriptar el PIN
CeldaSchema.pre('save', async function (next) {
  if (this.isNew && this.placaVehiculo) {
    try {
      const pinRaw = `${this.numeroCelda}${this.placaVehiculo}`;
      const salt = await bcrypt.genSalt(10);
      this.pin = await bcrypt.hash(pinRaw, salt);
    } catch (error) {
      return next(error); // Asegúrate de retornar next con el error
    }
  }
  next();
});

// Crear el modelo
export default model("Celda", CeldaSchema, "celda");
