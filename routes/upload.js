var express = require('express');
var fileUpload = require('express-fileupload'); //libreria para subir archivos
var fs = require('fs');

var Usuario = require('../models/usuario');
var Hospital = require('../models//hospital');
var Medico = require('../models/medico');
var app = express();
// default options
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    //Válidar tipo en la url
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            erros: { message: 'Tipo de colección no es válida' }
        });
    }

    // válidar si existe un archivo
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            erros: { message: 'debe de seleccionar una imagen' }
        });
    }
    //obtener nombre y extencion del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extencionArchivo = nombreCortado[nombreCortado.length - 1];

    // validar extenciones
    var extencionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidas.indexOf(extencionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida ' + extencionArchivo,
            erros: { message: 'Las extenciones válidas son: ' + extencionesValidas.join(', ') }
        });
    }
    // nombre del archivo
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extencionArchivo}`;

    // Mover el archivo del temporal a un Path en especifico
    var path = `./uploads/${ tipo }/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                erros: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un usuario con ese ID',
                    err: id
                });
            }
            var pathViejo = './uploads/usuarios/' + usuario.img;
            if (fs.existsSync(pathViejo)) { //compara un path con otro, devuelve un booleano
                fs.unlink(pathViejo); // elimina el path y toda referencia de este objeto
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => { // guarda el nuevo
                usuarioActualizado.password = 'xD';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de Usuario Actualizado',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un medico con ese ID',
                    err: id
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe ese medico',
                    err: id
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;
            if (fs.existsSync(pathViejo)) { //compara un path con otro, devuelve un booleano
                fs.unlink(pathViejo); // elimina el path y toda referencia de este objeto
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => { // guarda el nuevo
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico Actualizado',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un hospital con ese ID',
                    err: id
                });
            }
            var pathViejo = './uploads/hospitals/' + hospital.img;
            if (fs.existsSync(pathViejo)) { //compara un path con otro, devuelve un booleano
                fs.unlink(pathViejo); // elimina el path y toda referencia de este objeto
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => { // guarda el nuevo

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital Actualizado',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;