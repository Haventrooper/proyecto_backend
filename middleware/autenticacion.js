import jwt from 'jsonwebtoken';

function auth(req, res, next) {
    try {
        let token = req.headers.authorization.split(" ")[1]
        let id_usuario = jwt.verify(token, 'cualquiercosa')
        req.id_usuario = id_usuario.usuario
        console.log(req.id_usuario)
        
        next()
    }
    catch(e){
        console.error(e)
        res.status(401).send()
    }
}
export default auth