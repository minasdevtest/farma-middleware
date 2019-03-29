/**
 * Auth module
 */

import jwt from 'jsonwebtoken'
import { Router } from 'express'
import bodyParser from 'body-parser'
import User from '../models/user';
import { rejectIfEmpty, promiseCatchLog } from '../lib/util';

const { SECRET = 'nosecret', JWT_LIMIT = '7d' } = process.env

export function withAuth(req, res, next) {
    const { Authorization, authorization = Authorization || '' } = req.headers;
    const token = authorization.split(' ')[1]
    if (!token)
        return res.status(401).send({ auth: false, message: 'No auth' });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err)
            return res.status(500).send({ auth: false, code: err.name, message: err.message });

        // se tudo estiver ok, salva no request para uso posterior
        req.auth = decoded;
        console.log('Validationg')

        next();
    });
}

export function login() {
    const login = new Router()
    login.use(bodyParser.json());

    login.get((req, res) => res.send('batata'))

    login.get('/', withAuth, ({ auth }, res) => {
        const { user, role, exp } = auth
        res.send({ user, role, exp })
    })

    login.post('/', (req, res) => {
        console.log('login', req.body)
        const { email, password } = req.body
        User.authenticate({ email, password })
            .then(user => {
                console.log(user)
                if (!user) return res.status(404).send({ error: 'User not found' })
                jwt.sign({ user }, SECRET, { expiresIn: JWT_LIMIT },
                    function (err, token) {
                        if (err)
                            return res.status(500).send(err);
                        res.status(200).send({ auth: true, user, token: token });
                    });
            })
            .catch(promiseCatchLog())
            .catch(err => res.status(err.status || 500).send(err.message))
    })
    return login
}

export function userCRUD() {
    const router = new Router;
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json())

    router.get('/', (req, res) => {
        const { ...data } = req.body
        User.find()
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err.message))
    })
    router.post('/', (req, res) => {
        const { ...data } = req.body
        const user = new User(data)
        return user
            .save()
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err))
    })


    router.get('/:_id', (req, res) => {
        const { _id } = req.params
        User.findById(_id)
            .then(rejectIfEmpty('User not found'))
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err.message))
    })

    router.put('/:_id', (req, res) => {
        const { _id } = req.params
        const { ...data } = req.body
        User.findById(_id)
            .then(rejectIfEmpty('User not found'))
            .then(user => Object.assign(user, data, { _id }))
            .then(user => user.save())
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err.message))
    })

    router.delete('/:_id', (req, res) => {
        const { _id } = req.params
        User.deleteOne({ _id })
            .then(rejectIfEmpty('User not found'))
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err.message))
    })

    return router
}