import jwt from 'jsonwebtoken';

function authAdmin(req, res, next) {
    try {
        let token = req.headers.authorization.split(" ")[1]
        let id_administrador = jwt.verify(token, 'adminanything')
        req.id_administrador = id_administrador.administrador
        console.log(req.id_administrador)
        next()
    }
    catch(e){
        console.error(e)
        res.status(401).send()
    }
}
export default authAdmin