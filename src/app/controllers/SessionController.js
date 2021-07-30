const { User } = require('../models')

class SessionController {
    async store(req, res) {
        const { email, password } = req.body

        const user = await User.findOne({ where: { email }, individualHooks: true })

        if (!user) return res.status(401).json({ message: 'User not found' })

        const teste = await user.checkPassword(password)

        if (!teste) return res.status(401).json({ message: "Incorrect password" })

        return res.json({
            user,
            token: user.generateToken()
        })
    }
}

module.exports = new SessionController();