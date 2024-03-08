const express = require('express');
const router = express.Router();
const zod = require('zod')
router.use(express.json());
const { User, Account } = require('../db')
const jwt = require('jsonwebtoken')
const  {JWT_SECRET}  = require('../config')
const  { authMiddleware } = require("../middleware");

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(), 
    firstName: zod.string(),
    lastName: zod.string(),
})
const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post('/signup', async (req, res) => {
    const body = req.body;
    const { success } = signupSchema.safeParse(body)
    if (!success) {
        return res.status(411).json({ message: "Incorrect inputs" })
    }
    const user = await User.findOne({
        username: body.username
    })

    if (user) {
        return res.status(411).json({ message:"flsdjf"})
    }
    const newUser = await User.create({
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
    })
    const userId = newUser._id
    await Account.create({
        userId,
        balance: 1+ Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET)
    return res.json({
        message: "User created",
        token: token
    })
})

router.post('/signin', async (req, res) => {
    const body = req.body;
    const { success } = signinSchema.safeParse(body)
    if (!success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }
    const user = await User.findOne({
        username: body.username,
        password: body.password
    })

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET)

        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({ message: "Incorrect credentials" })
})

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        message: "Updated successfully"
    })
})


router.get("/bulk", async (req, res) => {
    const name = req.query.filter || "";
    const users = await User.find({ 
        $or: [{ 
            "firstName": {
                $regex: name
            }
        }, { 
            "lastName": {
                $regex: name
            } 
        }] 
    })
    res.json({
        user:users.map(user=>({
            username:user.username,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))
    })
})

module.exports = router