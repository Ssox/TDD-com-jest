const request = require('supertest')


const app = require('../../src/app')
const { password } = require('../../src/config/database')
const factory = require('../factories')
const truncate = require('../utils/truncate')

describe('Authentication', () => {
    beforeEach(async () => {
        await truncate()
    })
    test('it should authenticate with valid credentials', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })

        const response = await request(app)
            .post('/sessions')
            .send({
                email: user.email,
                password: '123123'
            })


        expect(response.status).toBe(200)
    })
    test('it should not authenticate with invalid email', async () => {
        const user = await factory.create('User')
        const response = await request(app)
            .post('/sessions')
            .send({
                email: 'saulox17xt@gmail.com',
                password: user.password
            })

        expect(response.status).toBe(401)
    })
    test('it should not authenticate with invalid password', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })
        const response = await request(app)
            .post('/sessions')
            .send({
                email: user.email,
                password: '123456'
            })

        expect(response.status).toBe(401)
    })
    test('is should return jwt token when authenticated', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })

        const response = await request(app)
            .post('/sessions')
            .send({
                email: user.email,
                password: '123123'
            })

        expect(response.body).toHaveProperty("token")
    })
    test('it should be able to access private routes when authenticated', async () => {
        const user = await factory.create('User', {
            password: '123123'
        })

        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', `Bearer ${user.generateToken()}`)

        expect(response.status).toBe(200)
    })
    test('it should not be able to access private routes without jwt token', async () => {
        const response = await request(app).get('/dashboard')

        expect(response.status).toBe(401)
    })
    test('it should not be able to access private routes with ivalid jwt token', async () => {
        const response = await request(app)
            .get('/dashboard')
            .set('Authorization', `Bearer 123123`)

        expect(response.status).toBe(401)
    })
})