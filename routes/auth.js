

// constraseña
const bcrypt = require('bcrypt');

const router = require('express').Router();
/* necesitamos crear un usuario y para eso tenemos importar nuestro modelo de usuario de user.js */
const User = require('../models/User')

const jwt = require('jsonwebtoken');

// validation
const Joi = require('@hapi/joi');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})
const schemaLogin = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

router.post('/login', async (req, res) => {
    // validaciones
    const { error } = schemaLogin.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message })
    
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'contraseña no válida' })
    
    // create token
    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)
        
    try {
        res.header('auth-token', token).json({
            error: null,
            data: {token}
        })
    } catch (error) {
        res.status(400).json(error)
    }
})



/* enviar una peticion al servidor */
router.post('/register', async (req, res) => {
    /* rec es lo que capturamos desde el frontend */
    /* res es el estatus */
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
        return res.status(400).json(
            {error: 'Email ya registrado'}
        )
    }
    const existEmail = await User.findOne({email: req.body.email})
    if (existEmail) {
        return res.status(400).json(
            {error: error.details[0].message}
        )
    }
     // hash contraseña
     const salt = await bcrypt.genSalt(10);
     const password = await bcrypt.hash(req.body.password, salt);
    /* llamamos a la validacion antes de guardar el usuario */
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: password
    })
    try {
        /* intenta guardarlo */
        const userDB = await user.save()
        res.json({
            error: null,
            data: userDB
        })
    } catch (error) {
        res.status(400).json(error)
    }
})

module.exports = router;