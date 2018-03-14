var express = require('express');
var jwt = require('jsonwebtoken'); //libreria del manager token
var Medico = require('../models/medico'); //modelo del usuario
var mdAutenticacion = require('../middlewares/autenticacion'); // validación del token para ejecutar una funcion

var app = express();

// ==========================
// OBTENER LISTADO DE medicos
// ===========================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') // obtiene el registro de usuario y solo muestra los campos nombre y email
        .populate('hospital') //obtiene el registro de hospital con todos sus campos
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la carga de medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    mensaje: medicos,
                    total: conteo
                });
            });

        });

});
// ==========================
// FIN OBTENER LISTADO DE MEdico
// ===========================
// ==========================
// ACTUALIZAR MEdico
// ===========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => { //findById busca el id de la url y sobre esta se actualiza
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'no existe un medico con ese id' }
            });
        }

        medico.nombre = body.nombre;
        //medico.img = body.img;
        medico.usuario = req.usuario._id; //el usuario que actualizo este medico
        medico.hospital = body.hospital; //id del hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});
// ==========================
//  FIN ACTUALIZAR medico
// ===========================

// ==========================
// CREAR UN NUEVO medico
// ===========================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        // img: body.img,
        usuario: req.usuario._id

    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Erro al crear el medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            message: 'Se creo con exito',
            body: medicoGuardado,
            creadox: req.usuario.nombre
        });

    });


});
// ==========================
// FIN UN NUEVO medico
// ===========================

// ==========================
// BORRAR medico
// ===========================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'no existe medico con ese id',
                error: { message: 'En la BD no existe ese Id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});
// ==========================
// FIN BORRAR medico
// ===========================

module.exports = app;