//Ejecucion de controladores en server

import routes from './routes/router.js';
import express from "express";

const app = express()
const port = 3000

routes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

/*

HTTP: GET POST PUT DELETE

CRUD: CREATE READ UPDATE DELETE


*/


/*import postgres from 'postgres';
import express from 'express';

const { QueryFile, IQueryFile } = require('pg-promise');
const pgp = require('pg-promise')();

const connectionOptions = {
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'diego05211998',
};

const db = pgp(connectionOptions);

module.exports = {
  db,
};



/*
import postgres from 'postgres';
import express from 'express';

const db = postgres({
  host: '127.0.0.1',
  port: 5432,
  username: 'postgres',
  password: 'diego05211998',
});

export default db;


/*
const app = express();
const port = 3000;

app.use('/', router);

router.get('/', (req, res) => {
  res.send('Pagina principal');
});
router.get("/about", function (req, res) {
  res.send("Acerca de esta aplicación");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

*/

/*

*/


