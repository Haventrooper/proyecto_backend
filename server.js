/*

import postgres from 'postgres'
import jwt from 'jsonwebtoken'

import express from "express";

const sql = postgres({
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'diego05211998'
})

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
*/

/*

HTTP: GET POST PUT DELETE

CRUD: CREATE READ UPDATE DELETE


*/

import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import express from 'express';

const sql = postgres({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'diego05211998'
});

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/login', async (req, res) => {

  // Buscar al usuario en la base de datos por nombre de usuario
  const { nombre, contrasena } = req.query;

  // Buscar al usuario en la base de datos por nombre de usuario
  const usuarios = await sql`SELECT * FROM usuarios WHERE nombre = ${nombre} and contrasena = ${contrasena}`;

  if (!usuarios || usuarios.length === 0) {
    return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
  }
  let usuarioEncontrado = null;
  for (const usuario of usuarios) {
    if (contrasena === usuario.contrasena) {
      usuarioEncontrado = usuario;
      break; // Se encontró el usuario, sal del bucle
    }
   }

  // Generar un token JWT para el usuario encontrado
  const token = jwt.sign({ usuario: usuarioEncontrado.nombre }, 'clave');
  res.send(token);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
