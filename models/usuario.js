var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'el nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'el correo es necesario'] },
    password: { type: String, required: [true, 'la contraseña es necesario'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER ROLE', enum: rolesValidos }
});
usuarioSchema.plugin(uniqueValidator, { message: 'el {PATH} debe de ser unico' });
module.exports = mongoose.model('Usuario', usuarioSchema);