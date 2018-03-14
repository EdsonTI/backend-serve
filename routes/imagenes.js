var express = require('express');
var fs = require('fs');
var app = express();

app.get('/:tipo/:img', (req, res, next) => { // se puede colocar token si es conveniente
    var tipo = req.params.tipo;
    var img = req.params.img;
    path = `./uploads/${tipo}/${img}`;

    fs.exists(path, existe => {
        if (!existe) {
            path = './assets/no-img.jpg';
        }
        res.sendfile(path);
    })
});

module.exports = app;