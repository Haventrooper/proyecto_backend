//Controladores backend

import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import auth from '../middleware/autenticacion.js';


const sql = postgres({
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'diego05211998'
})

function routes(app){
    app.get('/login', async (req, res) => {
        let response = await sql`
        select * from usuarios 
        where nombre = ${req.query.nombre} and contrasena = ${req.query.contrasena}
        `
        if (response.length == 0){
            res.send(false)
        }else{
            let token = jwt.sign({"usuario": response[0].id_usuario},'cualquiercosa')
            res.json({token}) //Se envia el token
        }
    })

    app.post('/register', async (req, res) => {
    })

    app.get('/nombreUsuario', auth, async (req, res)=>{
        try{
            let username = await sql`
            SELECT nombre
            FROM usuarios
            WHERE id_usuario = ${req.id_usuario}
            `            
            res.json({nombre: username[0].nombre})
        }
        catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Error en el servidor' });
          }
    })
    app.get('/actividades', auth, async (req, res) => {
        try {
            let actividades = await sql `
            select * from actividades
            `

            res.json(actividades)
        }
        catch(e) {
            console.log(e);
            res.status(500).send()
        }
    });

    app.get('/getActividad/:id_actividad', auth, async (req, res) => {
        try {
          const id_actividad = req.params.id_actividad; // Obtener el ID de la actividad de la ruta
          const actividad = await sql`
            SELECT * FROM actividades
            WHERE id_actividad = ${id_actividad};
          `;
      
          if (actividad && actividad.length > 0) {
            res.json(actividad[0]); // Devolver la primera actividad (asumiendo que el ID es único)
          } else {
            res.status(404).json({ mensaje: 'Actividad no encontrada' });
          }
        } catch (e) {
          console.log(e);
          res.status(500).send();
        }
      });
      

    app.get('/usuario', auth, async (req, res) => {
        try {
            let usuario = await sql`
            select * from usuarios
            where usuarios.id_usuario = ${req.id_usuario}
            `

            res.json(usuario[0]) //array completo
        }
        catch(e){
            console.log(e)
            res.status(500).send()
        }
    })

    app.get('/perrosUsuario', auth, async (req, res) => {
        try {
            let perros = await sql`
            SELECT perros.*, razas.nombre AS nombre_raza 
            FROM perros JOIN razas ON perros.id_raza = razas.id_raza
            WHERE perros.id_usuario =${req.id_usuario}
            `

            res.json(perros) //array completo
        }
        catch(e){
            console.log(e)
            res.status(500).send()
        }
    })

    app.get('/leerTema', auth, async (req, res) => {
        
        try {
            let tema = await sql`
            select temas.tema
            from usuarios join temas
            on usuarios.id_tema = temas.id_tema
            where usuarios.id_usuario = ${req.id_usuario}
        `
            res.json(tema[0]) //primer tema

        }
        catch(e){
            console.log(e)
            res.status(500).send()
        }
        
    })
    

}
export default routes
