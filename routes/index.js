const express = require('express');
const userRouter = require('./user')
const zod = require("zod")
const accountRouter = require('./account')
const router = express.Router();
const {authMiddleware} = require('../middleware');
const { User } = require('../db');

router.use('/user', userRouter) 
router.use('/account', accountRouter)


module.exports = router;