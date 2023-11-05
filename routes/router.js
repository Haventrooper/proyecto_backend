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


    app.post('/signup', async (req, res) => {

        let {id_tema, nombre, apellido, email, contrasena, fecha_creacion, fecha_nacimiento, sin_perro } = req.body;
        
        try {
    
            let result = await sql`
            INSERT INTO usuarios (id_tema, nombre, apellido, email, contrasena, fecha_creacion, fecha_nacimiento, sin_perro)
            VALUES (${id_tema}, ${nombre}, ${apellido}, ${email}, ${contrasena}, ${fecha_creacion}, ${fecha_nacimiento}, ${sin_perro})
            `;
            
            res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
        } 
        catch (error) {
            console.error('Error al registrar el usuario:', error);
            res.status(500).json({ mensaje: 'Error al registrar el usuario' });
        }
    });
    


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

    app.get('/getPasos/:id_actividad', auth, async (req, res) => {
        try {
            const id_actividad = req.params.id_actividad;
            const pasos = await sql`
            select * from pasos
            where id_actividad = ${id_actividad};
            `;
            res.json(pasos)

        }catch(error){
            console.log(error);
            res.status(500).send();
        }
    });

    app.get('/getActividad/:id_actividad', auth, async (req, res) => {
        try {
          const id_actividad = req.params.id_actividad;
          const actividad = await sql`
            SELECT * FROM actividades
            WHERE id_actividad = ${id_actividad};
          `;
      
          if (actividad && actividad.length > 0) {
            res.json(actividad[0]);
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

    app.get('/perro/:id_perro', auth, async (req, res) => {
        try {
          const id_perro = req.params.id_perro;
          const perro = await sql`
          SELECT Perros.*, Razas.nombre AS nombre_raza
          FROM Perros
          INNER JOIN Razas ON Perros.id_raza = Razas.id_raza
          WHERE Perros.id_perro = ${id_perro};
          `;
      
          if (perro && perro.length > 0) {
            res.json(perro);
          } else {
            res.status(404).json({ mensaje: 'Perro no encontrado' });
          }
        } catch (e) {
          console.log(e);
          res.status(500).send();
        }
      });

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
    
    app.get('/categorias', auth, async (req, res) => {
        try {
            let categorias = await sql`
            select * from categorias
            `
            res.json(categorias)
        }
        catch(error){
            console.log(error)
            res.status(500).send()
        }
    })

    app.get('/actividadesPorCategoria/:id_categoria', auth, async (req, res) => {
        try {
            const id_categoria = req.params.id_categoria;
            let actividadesCat = await sql`
            select * from actividades
            where id_categoria = ${id_categoria}
            `
            res.json(actividadesCat)
        }
        catch(error){
            console.log("Error al obtener actividades por categorias");
            res.status(500).send()
        }
    })

    app.get('/sugerencias', auth, async (req, res)=> {
        try {
            const sugerencias = await sql`
            select * from sugerencias
            `;
            res.json(sugerencias)
        }catch(error){
            console.log("Error al obtener sugerencias")
            res.status(500),send()
        }
    });

    app.get('/sugerencias/:id_raza', auth, async (req, res) =>{
        try{
            const id_raza = req.params.id_raza;
            let sugerenciaRaza = await sql`
            select * from sugerencias
            where id_raza = ${id_raza}
            `;
            res.json(sugerenciaRaza);
        }
        catch(error){
            console.log("Error al obtener sugerencia por raza");
            res.status(500).send();
        }
    })
}
export default routes
