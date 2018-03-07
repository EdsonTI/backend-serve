// requires, librerias de terceros
var express = require('express'); //referencia al servidor
var mongoose = require('mongoose') //referencia a un ODM para interactuar con la BD


// Inicializar variables, usamos la libreria
var app = express(); // definiendo el servidor express
//conexion a la base de datos con  mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});


// rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion Realizada correctamente'
    });
});


// escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});