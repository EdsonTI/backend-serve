var express = require('express'); //libreria del servidor mongo
var bcrypt = require('bcryptjs'); //libreria para encriptar el password
var jwt = require('jsonwebtoken'); //libreria del manager token
var SEED = require('../config/config').SEED; //la no se que... del token

var Usuario = require('../models/usuario'); //modelo del usuario
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express(); // iniciando base de datos


// ==========================
// OBTENER LISTADO DE USUARIOS
// ===========================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error en la carga de usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: usuarios
                });

            });

});
// ==========================
// FIN OBTENER LISTADO DE USUARIOS
// ===========================




// ==========================
// ACTUALIZAR USUARIO
// ===========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.find(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'no existe un usuario con ese id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = 'desencryptame';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});
// ==========================
//  FIN ACTUALIZAR USUARIO
// ===========================

// ==========================
// CREAR UN NUEVO USUARIO
// ===========================
app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Erro al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });


});
// ==========================
// FIN UN NUEVO USUARIO
// ===========================

// ==========================
// BORRAR USUARIO
// ===========================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'no existe usuario con ese id',
                error: { message: 'En la BD no existe ese Id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});
// ==========================
// FIN BORRAR USUARIO
// ===========================
module.exports = app;