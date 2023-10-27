//Controladores backend

import postgres from 'postgres';
import jwt from 'jsonwebtoken';

const sql = postgres({
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'diego05211998'
})

function routes(app){
    app.get('/login', async (req, res) => {
        let contrasena = await sql`
        select * from usuarios 
        where nombre = ${req.query.nombre} and contrasena = ${req.query.contrasena}
        `
        if (contrasena.length == 0){
            res.send(false)
        }else{
            let token = jwt.sign({"usuario": req.query.nombre},'cualquiercosa')
            res.send(token)
        }    
    })    
}
export default routes

/*import express from 'express';
import db from './db';

const router = express.Router();


const express = require('express');

// Ruta de inicio
router.get('/', (req, res) => {
  res.send('Página de inicio');
});

// Ruta de inicio de sesión
router.get('/login', (req, res) => {
  res.send('Página de inicio de sesión');
});

// Ruta de registro
router.get('/signup', (req, res) => {
  res.send('Página de registro');
});

// Ruta de perfil de usuario
router.get('/perfil-usuario', (req, res) => {
  res.send('Página de perfil de usuario');
});

// Ruta de perfil de perro
router.get('/perfil-perro', (req, res) => {
  res.send('Página de perfil de perro');
});

module.exports = router;

*/