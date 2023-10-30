//Ejecucion de controladores en server

import routes from './routes/router.js';
import express from "express";
import cors from "cors"

const app = express()
const port = 3000

app.use(cors())

routes(app);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})