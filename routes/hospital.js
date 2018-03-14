var express = require('express'); //libreria del servidor mongo
var jwt = require('jsonwebtoken'); //libreria del manager token

var Hospital = require('../models/hospital'); //modelo del usuario
var mdAutenticacion = require('../middlewares/autenticacion'); // validación del token para ejecutar una funcion

var app = express(); // iniciando base de datos


// ==========================
// OBTENER LISTADO DE HOSPITALES
// ===========================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}).populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la carga de hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    mensaje: hospitales,
                    total: conteo
                });
            });

        });

});
// ==========================
// FIN OBTENER LISTADO DE Hospital
// ===========================
// ==========================
// ACTUALIZAR Hospital
// ===========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => { //findById busca el id de la url y sobre esta se actualiza
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'no existe un hospital con ese id' }
            });
        }

        hospital.nombre = body.nombre;
        //hospital.img = body.img;
        hospital.usuario = req.usuario._id; //el usuario que actualizo este hospital

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});
// ==========================
//  FIN ACTUALIZAR hospital
// ===========================

// ==========================
// CREAR UN NUEVO hospital
// ===========================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        // img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Erro al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            body: hospitalGuardado,
            creadox: req.usuario.nombre
        });

    });


});
// ==========================
// FIN UN NUEVO hospital
// ===========================

// ==========================
// BORRAR hospital
// ===========================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, HospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Erro al borrar Hospital',
                errors: err
            });
        }

        if (!HospitalBorrado) {
            return res.status(400).json({
                ok: false,
                message: 'no existe Hospital con ese id',
                error: { message: 'En la BD no existe ese Id ' + id }
            });
        }

        res.status(200).json({
            ok: true,
            Hospital: HospitalBorrado
        });

    });
});
// ==========================
// FIN BORRAR hospital
// ===========================
module.exports = app;