//Ejecucion de controladores en server

import routes from './routes/router.js';
import express from "express";

const app = express()
const port = 3000

routes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})