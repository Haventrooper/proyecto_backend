//Controladores backend

import postgres from 'postgres';
import jwt from 'jsonwebtoken';
import auth from '../middleware/autenticacion.js';
import authAdmin from '../middleware/authAdmin.js';
import cron from "node-cron"
import bcrypt from "bcrypt"


const sql = postgres({
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'diego05211998'
})


function routes(app){

    app.get('/login', async (req, res) => {
        try{
            let response = await sql`
            select * from usuarios 
            where email = ${req.query.email}
            `

            if (response.length === 0) {
                // Usuario no encontrado
                return res.json({ success: false, message: 'Usuario no encontrado' });
            }

            bcrypt.compare(req.query.contrasena, response[0].contrasena, function(err, result) {
                if (!result){
                    res.json({ success: false, message: 'Contraseña incorrecta' });
                }else{
                    let token = jwt.sign({"usuario": response[0].id_usuario},'cualquiercosa')
                    res.json({ success: true, token });
                }
            });
        } 
        catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error en el servidor' });
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
    });
    
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

      app.get('/verificarActividad/:id_perro/:id_actividad', auth, async (req, res) => {
        
        try {

        const idPerro = req.params.id_perro;
        const idActividad = req.params.id_actividad;
        const actividadConsulta = await sql`
            SELECT * FROM actividades_perros
            WHERE id_perro = ${idPerro} AND id_actividad = ${idActividad};
        `;

        if (actividadConsulta && actividadConsulta.length > 0) {
            res.status(200).json({mensaje: 'Actividad ya en BD'})
          } else {
            res.status(404).json({ mensaje: 'No hay actividad guardada en BD' });
        }
        } catch (error) {
          console.error('Error al verificar la actividad:', error);
          res.status(500).json({ mensaje: 'Error al verificar la actividad' });
        }
      });
      
      

    app.get('/usuario', auth, async (req, res) => {
        try {
            let usuario = await sql`
            select * from usuarios
            where usuarios.id_usuario = ${req.id_usuario}
            `

            res.json(usuario[0])
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

            res.json(perros)
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
            res.json(tema[0])

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

    app.get('/razas', auth, async (req, res)=> {
        try {
            const razas = await sql`
            select * from razas
            `;
            res.json(razas)
        }catch(error){
            console.log("Error al obtener razas")
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
    });

    app.get('/actividadPerro/:id_perro', auth, async (req, res) => {
        try{
        const id_perro = req.params.id_perro;
        const actividadPerro = await sql`
        SELECT actividades.*, actividades_perros.id_perro, actividades_perros.contador
        FROM actividades
        INNER JOIN actividades_perros ON actividades.id_actividad = actividades_perros.id_actividad
        WHERE actividades_perros.id_perro = ${id_perro};
        `
        res.json(actividadPerro);
        }
        catch(error){
            console.log("Error al obtener actividad por id");
            res.status(500).send();
        }        
    });

    app.get('/actividadesRecientes/:id_perro', auth, async (req, res) =>{
        try{
            const id_perro = req.params.id_perro;
            const actividadPerroReciente = await sql`
            SELECT ar.*, a.*
            FROM actividades_recientes ar
            JOIN actividades a ON ar.id_actividad = a.id_actividad
            WHERE ar.id_perro = ${id_perro}
            ORDER BY ar.fecha_reciente DESC;
            `
            res.json(actividadPerroReciente);
            }
            catch(error){
                console.log("Error al obtener actividad reciente por id");
                res.status(500).send();
            }        
    });

    //POST
    
    app.post('/signup', async (req, res) => {

        let {id_tema, nombre, apellido, email, contrasena, fecha_creacion, fecha_nacimiento, sin_perro } = req.body;
        
        try {
            const existingUser = await sql`
                SELECT * FROM usuarios
                WHERE email = ${email}
            `;

            if (existingUser.length > 0) {
                return res.status(409).json({ mensaje: 'Correo electrónico ya registrado.' });
            }

            const hashedPassword = await bcrypt.hash(contrasena, 10);
    
            let result = await sql`
            INSERT INTO usuarios (id_tema, nombre, apellido, email, contrasena, fecha_creacion, fecha_nacimiento, sin_perro)
            VALUES (1, ${nombre}, ${apellido}, ${email}, ${hashedPassword}, now(), ${fecha_nacimiento}, false)
            `;
            
            res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
        } 
        catch (error) {
            console.error('Error al registrar el usuario:', error);
            res.status(500).json({ mensaje: 'Error al registrar el usuario' });
        }
    });

    app.post('/registroPerro', auth, async (req, res) => {

        const id_usuario = req.id_usuario

        let { id_raza, nombre, fecha_nacimiento, genero } = req.body;
        
        try {
          const registroPerro = await sql`
            INSERT INTO perros (id_usuario, id_raza, nombre, fecha_nacimiento, genero)
            VALUES (${id_usuario}, ${id_raza}, ${nombre}, ${fecha_nacimiento}, ${genero});
          `;
      
          res.status(201).json({ mensaje: 'El perro se ha registrado correctamente' });
        } catch (error) {
          console.error('Error al registrar el perro:', error);
          res.status(500).json({ mensaje: 'Error al registrar el perro' });
        }
      });

      app.post('/guardarActividad/:id_perro/:id_actividad', auth, async (req, res) => {        
        const idPerro = req.params.id_perro;
        const idActividad = req.params.id_actividad;
        const contador = req.body.contador;

        try {
            const registroActividad = await sql`
            insert into actividades_perros (id_perro, id_actividad, contador)
            values (${idPerro},${idActividad},${contador});
            `

            res.status(201).json({mensaje: 'La actividad se ha registrado correctamente'})
        }
        catch(error){
            console.error('Error al guardar actividad:', error);
            res.status(500).json({ mensaje: 'Error al guardar actividad' });
        }
      });

      app.post('/guardarActividadReciente/:id_perro/:id_actividad', auth, async (req, res)=>{
        const idPerro = req.params.id_perro;
        const idActividad = req.params.id_actividad;
        const fecha_reciente = new Date(req.body.fecha_reciente).toUTCString();

        try {
            const registroActividad = await sql`
            INSERT INTO actividades_recientes (id_perro, id_actividad, fecha_reciente)
            VALUES (${idPerro}, ${idActividad}, ${fecha_reciente})
            ON CONFLICT (id_perro, id_actividad) DO UPDATE SET fecha_reciente = ${fecha_reciente};
            `

            if (registroActividad.affectedRows > 0) {
                res.status(201).json({ mensaje: 'La actividad reciente se ha registrado correctamente' });
            } else {
                res.status(200).json({ mensaje: 'La actividad reciente ya está registrada' });
            }        
        }
        catch(error){
            console.error('Error al guardar actividad reciente:', error);
            res.status(500).json({ mensaje: 'Error al guardar actividad reciente' });
        }
      });

      //PUT

      app.put('/actualizarActividad/:id_perro/:id_actividad', auth, async (req, res) => {        
        const idPerro = req.params.id_perro;
        const idActividad = req.params.id_actividad;
        const nuevoContador = req.body.contador;
    
        try {
            const actualizacionActividad = await sql`
                UPDATE actividades_perros
                SET contador = ${nuevoContador}
                WHERE id_perro = ${idPerro} AND id_actividad = ${idActividad};
            `;
            
            res.status(200).json({ mensaje: 'El contador de la actividad se ha actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el contador de la actividad:', error);
            res.status(500).json({ mensaje: 'Error al actualizar el contador de la actividad' });
        }
    });
    

      app.put('/modificarUsuario', auth, async (req, res) => {

        const { nombre, apellido, email, fecha_nacimiento } = req.body;
      
        try {
          let result = await sql`
            UPDATE usuarios
            SET nombre = ${nombre}, apellido = ${apellido}, email = ${email}, fecha_nacimiento = ${fecha_nacimiento}
            WHERE id_usuario = ${req.id_usuario}
          `;
      
          res.status(200).json({ mensaje: 'Datos de usuario actualizados con éxito' });
        } catch (error) {
          console.error('Error al actualizar los datos de usuario:', error);
          res.status(500).json({ mensaje: 'Error al actualizar los datos de usuario' });
        }
      });
      
      app.put('/modificarPerro/:id_perro', auth, async (req, res) => {
        const id_perro = req.params.id_perro;
        const { id_raza, nombre, fecha_nacimiento, genero } = req.body;
      
        try {
          const actualizacionPerro = await sql`
            UPDATE perros
            SET id_raza = ${id_raza}, nombre = ${nombre}, fecha_nacimiento = ${fecha_nacimiento}, genero = ${genero}
            WHERE id_perro = ${id_perro}
          `;
      
          res.status(200).json({ mensaje: 'El perro se ha modificado correctamente' });
        } catch (error) {
          console.error('Error al modificar el perro:', error);
          res.status(500).json({ mensaje: 'Error al modificar el perro' });
        }
      });

      //DELETE

      app.delete('/eliminarUsuario/:id_usuario', auth, async (req, res) => {
        try {
          const id_usuario = req.params.id_usuario;
          const perros = await sql`SELECT id_perro FROM perros WHERE id_usuario = ${id_usuario}`;
      
          for (const perro of perros) {
            await sql`DELETE FROM actividades_perros WHERE id_perro = ${perro.id_perro}`;
            await sql`DELETE FROM actividades_recientes WHERE id_perro = ${perro.id_perro}`;
          }
      
          await sql`DELETE FROM perros WHERE id_usuario = ${id_usuario}`;
      
          await sql`DELETE FROM usuarios WHERE id_usuario = ${id_usuario}`;
      
          res.status(200).json({ mensaje: 'Usuario y sus perros relacionados eliminados con éxito' });
        } catch (error) {
          console.error('Error al eliminar el usuario y sus perros relacionados:', error);
          res.status(500).json({ mensaje: 'Error al eliminar el usuario y sus perros relacionados' });
        }
      });
      
      app.delete('/eliminarPerro/:id_perro', auth, async (req, res) => {
        const id_perro = req.params.id_perro;
        try {
            await sql`
            DELETE FROM actividades_perros
            WHERE id_perro = ${id_perro}
          `;

          await sql`
            DELETE FROM actividades_recientes
            WHERE id_perro = ${id_perro}
          `;
      
          const eliminacionPerro = await sql`
            DELETE FROM perros
            WHERE id_perro = ${id_perro}
          `;
          res.status(200).json({ mensaje: 'Perro eliminado con éxito' });
          
        } catch (error) {
          console.error('Error al eliminar el perro:', error);
          res.status(500).json({ mensaje: 'Error al eliminar el perro' });
        }
      });

      app.delete('/eliminarActividadPorPerro/:id_perro/:id_actividad', auth, async (req, res) => {
        const idPerro = req.params.id_perro;
        const idActividad = req.params.id_actividad;
      
        try {
          const eliminacionActividad = await sql`
            DELETE FROM actividades_perros
            WHERE id_perro = ${idPerro} AND id_actividad = ${idActividad}
          `;
      
          res.status(200).json({ mensaje: 'Actividad de perro eliminada con éxito' });

        } catch (error) {
          console.error('Error al eliminar la actividad del perro:', error);
          res.status(500).json({ mensaje: 'Error al eliminar la actividad del perro' });
        }
      });

      cron.schedule('0 0 * * *', async () => {
        try {
          const limiteTiempo = new Date();
          limiteTiempo.setDate(limiteTiempo.getDate() - 1); 
      
          const actualizarActividades = await sql`
          DELETE FROM actividades_recientes WHERE fecha_reciente < ${limiteTiempo}
          `
          console.log('Actividades recientes antiguas eliminadas con éxito');
        } catch (error) {
          console.error('Error al eliminar actividades recientes antiguas:', error);
        }
      });


      //OPCIONES DE ADMINISTRADOR
      app.get('/admin', async (req, res) => {
        try{

        let response = await sql`
        select * from administradores 
        where email = ${req.query.email}
        `

        if (response.length === 0) {
            // Administrador no encontrado
            return res.json({ success: false, message: 'Administrador no encontrado' });
        }

        bcrypt.compare(req.query.contrasena, response[0].contrasena, function(err, result) {
            if (!result){
                res.json({ success: false, message: 'Contraseña incorrecta' });
            }else{
                let token = jwt.sign({"administrador": response[0].id_administrador},'adminanything')
                    res.json({ success: true, token });
            }
        });
        }
            catch(error){
            console.log(error);
            res.status(403).json({ message: 'Error en el no encontrado' });
        }
    });

    app.get('/adminUsuarios', authAdmin, async (req, res) =>{
        try{
            let response = await sql`
            select * from usuarios
            `
            res.json(response)
        }
        catch(error){
            console.error("No se encontraron los usuarios");
            res.status(500).send()
        }
    });

    app.get('/getCategorias', authAdmin, async (req, res) => {
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

    app.get('/actividadesAdmin', authAdmin, async (req, res) => {
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

    app.get('/pasosActividad/:id_actividad', authAdmin, async (req, res) => {
        try{
            const id_actividad = req.params.id_actividad
            const pasos = await sql`
            select * from pasos
            where id_actividad = ${id_actividad}
            `
            res.json(pasos)
            
        }catch(error){
            console.error("Ha habido un problema con la consulta");
        }
    });
    
    app.get('/getSugerencias', authAdmin, async (req, res) => {
        try{
            const sugerencias = await sql`
            select * from sugerencias
            `
            res.json(sugerencias)
            
        }catch(error){
            console.error("Ha habido un problema con la consulta de sugerencias");
        }
    });

    app.get('/getSugerencias/:id_sugerencia', authAdmin, async (req, res) => {
        try{
            const id_sugerencia = req.params.id_sugerencia
            const sugerencias = await sql`
            select * from sugerencias
            where id_sugerencia = ${id_sugerencia}
            `
            res.json(sugerencias)
            
        }catch(error){
            console.error("Ha habido un problema con la consulta de sugerencias");
        }
    });

    app.get('/getRazas', authAdmin, async (req, res) =>{
        try{
            const razas = await sql`
            select * from razas
            `
            res.json(razas)
            
        }catch(error){
            console.error("Ha habido un problema con la consulta de razas");
        }
    });

    app.get('/getRazas/:id_raza', authAdmin, async (req, res) =>{
        try{
            const id_raza = req.params.id_raza

            const razas = await sql`
            select * from razas
            where id_raza = ${id_raza}
            `
            res.json(razas)
            
        }catch(error){
            console.error("Ha habido un problema con la consulta de razas");
        }
    });

    app.post('/postCategoria', authAdmin, async (req, res) =>{
        let { nombre, descripcion } = req.body;
        try{
            const consulta = await sql`
            insert into categorias(nombre, descripcion)
            values (${nombre} , ${descripcion})
            `
            res.status(201).json({mensaje: 'La categoría se ha registrado correctamente'})
            
        }catch(error){
            console.error("Ha habido un problema con el registro de categoria");
        }
    })

    app.post('/pasoActividad', authAdmin, async (req, res) => {
        let { id_actividad, titulo, nombre, descripcion, imagen } = req.body;
        try{
            const consulta = await sql`
            insert into pasos(id_actividad, titulo, nombre, descripcion, imagen)
            values (${id_actividad}, ${titulo}, ${nombre} , ${descripcion}, ${imagen})
            `
            res.status(201).json({mensaje: 'La actividad se ha registrado correctamente'})
            
        }catch(error){
            console.error("Ha habido un problema con el registro");
        }
    });
    
    app.post('/actividadesAdmin', authAdmin, async (req, res) =>{
        let { id_categoria, nombre, descripcion, imagen } = req.body;

        try{
            const consulta = await sql`
            insert into actividades (id_categoria, nombre, descripcion, fecha_creacion, calificacion, progreso, contador, imagen)
            values (${id_categoria}, ${nombre} , ${descripcion}, now(), 5, 0, 0, ${imagen} )
            `
            res.status(201).json({mensaje: 'La actividad se ha registrado correctamente'})
            
        }catch(error){
            console.error("Ha habido un problema con el registro");
        }
    })

    app.post('/postRaza', authAdmin, async (req, res) =>{
        let { nombre } = req.body;
        try{
            const consulta = await sql`
            insert into razas(nombre)
            values (${nombre})
            `
            res.status(201).json({mensaje: 'La raza se ha registrado correctamente'})
            
        }catch(error){
            console.error("Ha habido un problema con el registro de raza");
        }
    });

    app.post('/postSugerencia', authAdmin, async (req, res) =>{
        let { id_raza, nombre, descripcion } = req.body;
        try{
            const consulta = await sql`
            insert into sugerencias(id_raza, nombre, descripcion)
            values (${id_raza}, ${nombre} , ${descripcion});
            `
            res.status(201).json({mensaje: 'La sugerencia se ha registrado correctamente'})
            
        }catch(error){
            console.error("Ha habido un problema con el registro de sugerencia");
        }
    });

    app.delete('/eliminarActividadYPasos/:id_actividad', authAdmin, async (req, res) => {
        const idActividad = req.params.id_actividad;
      
        try {
            const eliminacionPasos = await sql`
              DELETE FROM pasos
              WHERE id_actividad = ${idActividad}
            `;
            const eliminacionActividades_perros = await sql`
            DELETE FROM actividades_perros
            WHERE id_actividad = ${idActividad}
            `;
            
            const eliminarActividadesRecientes = await sql`
            DELETE FROM actividades_recientes
            WHERE id_actividad = ${idActividad}
            `;

            const eliminacionActividad = await sql`
              DELETE FROM actividades
              WHERE id_actividad = ${idActividad}
            `;

            res.status(200).json({ mensaje: 'Actividad y pasos eliminados con éxito' });

          } catch (error) {
            console.error('Error al eliminar la actividad y sus pasos:', error);
            res.status(500).json({ mensaje: 'Error al eliminar la actividad y sus pasos' });
          }
      });

    app.delete('/eliminarPaso/:id_paso', authAdmin, async (req, res) => {
        const idPaso = req.params.id_paso;
    
        try {
        const eliminacionPaso = await sql`
            DELETE FROM pasos
            WHERE id_paso = ${idPaso}
        `;
    
        res.status(200).json({ mensaje: 'Paso eliminado con éxito' });

        } catch (error) {
            console.error('Error al eliminar el paso:', error);
            res.status(500).json({ mensaje: 'Error al eliminar el paso' });
        }
    });
    
    app.delete('/eliminarSugerencia/:id_sugerencia', authAdmin, async (req, res) => {
        const id_sugerencia = req.params.id_sugerencia;
    
        try {
        const eliminacionSugerencia = await sql`
            DELETE FROM sugerencias
            WHERE id_sugerencia = ${id_sugerencia}
        `;
    
        res.status(200).json({ mensaje: 'Sugerencia eliminada con éxito' });

        } catch (error) {
            console.error('Error al eliminar la sugerencia:', error);
            res.status(500).json({ mensaje: 'Error al eliminar la sugerencia' });
        }
    });    

    app.delete('/eliminarRaza/:id_raza', authAdmin, async (req, res) => {
        const id_raza = req.params.id_raza;
    
        try {
            
        const eliminacionRaza = await sql`
            DELETE FROM razas
            WHERE id_raza = ${id_raza}
        `;
    
        res.status(200).json({ mensaje: 'Raza eliminada con éxito' });

        } catch (error) {
            console.error('Error al eliminar la raza:', error);
            res.status(500).json({ mensaje: 'Error al eliminar la raza' });
        }
    });    

    app.delete('/deleteCategoria/:id_categoria', authAdmin, async (req, res) => {
        const id_categoria = req.params.id_categoria;
    
        try {
        const consulta = await sql`
            DELETE FROM categorias
            WHERE id_categoria = ${id_categoria}
        `;
    
        res.status(200).json({ mensaje: 'Categoria eliminada con éxito' });

        } catch (error) {
            console.error('Error al eliminar la categoria:', error);
            res.status(500).json({ mensaje: 'Error al eliminar la categoria' });
        }
    });
}
export default routes
