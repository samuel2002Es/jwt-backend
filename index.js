/* para hacer el deploy utilice https://railway.app/ solo recuerda subir el proyecto desde github y incluir las variables de entorno asi como el node index del package.json */
const express = require('express');
/* conectarnos a la base de datos */
const mongoose = require('mongoose');
/* capturar el body */
const bodyparser = require('body-parser');
/* variables de entorno */
/* para que el servicio no busque variables de entorno en produccion utilizamos */
/* require('dotenv').config() */
if (process.env.NODE_ENV !=  'production') {
    require('dotenv').config();
}

const app = express();

// cors
const cors = require('cors');
var corsOptions = {
    origin: '*', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

// capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Conexión a Base de datos
/* sucede y acontece que no pude cambiar una variable que ya existe, creo que se sobre pone */
const uri = `mongodb+srv://${process.env.USERS}:${process.env.PASSWORD}@cluster0.3ajvdoi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
/* const uri4 = `mongodb+srv://${process.env.USERS}:${process.env.PASSWORD}@cluster0.3ajvdoi.mongodb.net/test` */
/* const uri =  'mongodb+srv://samuel2002Es:espinoza27@cluster0.3ajvdoi.mongodb.net/test' */
const option = {useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(uri,option)
.then(() => console.log('Base de datos conectada'))
.then(()=> console.log(process.env.USERS))
.catch(e => console.log('error db:', e))

// import routes
const authRoutes = require('./routes/auth');
// import routes
const dashboadRoutes = require('./routes/admin');
const verifyToken = require('./routes/validate-token');



// route middlewares
app.use('/api/user', authRoutes);
app.use('/api/admin', verifyToken, dashboadRoutes);
app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});

// iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`)
})