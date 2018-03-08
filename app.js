// requires, librerias de terceros
var express = require('express'); //referencia al servidor
var mongoose = require('mongoose') //referencia a un ODM para interactuar con la BD
var bodyParser = require('body-parser') //referencia a body parser
    // Inicializar variables, usamos la libreria
var app = express(); // definiendo el servidor express

// BODY PARSE
// parse application/x-www-form-urlencoded // parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar rutas routes/...
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuario');
// fin importar rutas


//conexion a la base de datos con  mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);
// FIN RUTAS

// escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});