// requires, librerias de terceros
var express = require('express'); //referencia al servidor
var mongoose = require('mongoose') //referencia a un ODM para interactuar con la BD
var bodyParser = require('body-parser') //referencia a body parser
    // Inicializar variables, usamos la libreria
var app = express(); // definiendo el servidor express

//DA PERMISO PARA EJECUTAR COMANDOS DE OTROS DOMINIOS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");// acepta los metodos de http
  next();
});

// BODY PARSE
// parse application/x-www-form-urlencoded // parse application/json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar rutas routes/...
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');
// fin importar rutas


//conexion a la base de datos con  mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

// RUTAS
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/login', loginRoutes);
app.use('/medico', medicoRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);
// FIN RUTAS

// escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});