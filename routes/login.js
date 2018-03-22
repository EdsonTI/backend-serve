var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Usuario = require('../models/usuario');
var SEED = require('../config/config').SEED;

//VARIABLES PARA GOOGLE SIGN IN
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


var app = express();

//=================
// AUTENTICACIÓN GOOGLE
//=================
app.post('/google', (req, res) => {
    var token = req.body.token || 'xx';
    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'error al buscar usuario-login',
                    errors: err
                });
            }
            if (usuario) { // si existe el usuario
                if (usuario.google === false) { // el correo existe con autenticación normal
                    return res.status(400).json({
                        ok: true,
                        message: 'debe de usar la autenticación normal'
                    });
                } else { // el correo tiene autenticación con google
                    usuario.password = ':D';
                    //CREAR UN TOKEn
                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); //generacion de token

                    //FIN CREAR TOKEN
                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id
                    });
                }
            } else { //no existe el usuario en la BD
                // aqui se guardan los atributos de google en nuestro clase usuario
                var usuario = new Usuario();
                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = '=D';
                usuario.img = payload.picture; // imagen de google
                usuario.google = true;

                usuario.save((err, usuarioDB) => { // guardando el usuario en la base de datos
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            message: 'error al crear usuario-google',
                            errors: err
                        });
                    }

                    usuario.password = ':D';
                    //CREAR UN TOKEn
                    var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //generacion de token

                    //FIN CREAR TOKEN
                    res.status(200).json({
                        ok: true,
                        message: 'SE CREO CON EXITO EL USUARIO DE GOOGLE',
                        usuario: usuarioDB,
                        token: token,
                        id: usuarioDB._id,
                        img: usuarioDB.img
                    });
                });
            }
        });
    }
    verify().catch(err => {
        return res.status(400).json({
            ok: false,
            message: 'Error de verificacion de token'
        });
    });

});

//=================
// AUTENTICACIÓN NORMAL
//=================
app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email },
        (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al buscar usuario',
                    erros: err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: false,
                    message: 'Credenciales incorrectas  -- EMAIL(borrar)'
                });
            }

            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
                return res.status(400).json({
                    ok: false,
                    message: 'Credenciales incorrectas  -- PASSWORD(borrar)'
                });
            }


            //CREAR UN TOKEn
            var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //generacion de token

            //FIN CREAR TOKEN

            res.status(200).json({
                ok: true,
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });
        });
});


module.exports = app;