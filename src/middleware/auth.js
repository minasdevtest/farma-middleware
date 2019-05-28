/**
 * Auth module
 */

import jwt from 'jsonwebtoken'
import { Router } from 'express'
import bodyParser from 'body-parser'
import User from '../models/user';
import { rejectIfEmpty, promiseCatchLog, promiseLog, errorResponse } from '../lib/util';
import Roles from '../models/roles';

const { SECRET = 'nosecret', JWT_LIMIT = '7d' } = process.env

export function withAuth(req, res, next) {
    const { Authorization, authorization = Authorization || '' } = req.headers;
    console.log('With Auth')
    const token = authorization.split(' ')[1]
    if (!token)
        return res.status(401).send({ auth: false, message: 'No auth' });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err)
            return res.status(401).send({ auth: false, code: err.name, message: err.message });

        // se tudo estiver ok, salva no request para uso posterior
        req.auth = decoded;
        console.log('Validating')

        next();
    });
}

export function withPermission(...permissions) {
    return (req, res, next) => withAuth(req, res,
        (error) => {
            console.log('With Permission', permissions)
            if (error)
                return next(error)
            return User.findById(req.auth.user._id)
                .then(rejectIfEmpty('Invalid Auth', 401))
                .then(promiseLog("\n"))
                .then(user => Roles.checkPermission(permissions, user.roles) ? next() : res.send(401))
                .catch(errorResponse(res))
        })
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
            .catch(errorResponse(res))
    })
    return login
}

export function userManagement() {
    const router = new Router;

    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json())

    router.post('/', ({ body: { email, name, password } }, res) => {
        const user = new User({ email, name, password, roles: 'user' })
        return user
            .save()
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err))
    })

    router.use(withAuth)

    router.get('/', (req, res) =>
        User.findById(req.auth.user._id)
            .then(rejectIfEmpty('User not found'))
            .then(status => res.send(status))
            .catch(errorResponse(res))
    )

    router.put('/password', ({ auth: { user: { _id } }, body: { password } }, res) => {
        User.findById(_id)
            .then(rejectIfEmpty('User not found'))
            .then(user => Object.assign(user, { password }))
            .then(user => user.save())
            .then(status => res.send(status))
            .catch(errorResponse(res))
    })

    router.put('/', ({ auth: { user: { _id } }, body: { name, email } }, res) =>
        User.findById(_id)
            .then(rejectIfEmpty('User not found'))
            .then(user => Object.assign(user, { name, email }))
            .then(user => user.save())
            .then(status => res.send(status))
            .catch(errorResponse(res))

    )

    router.delete('/', ({ auth: { user: { _id } } }, res) =>
        User.deleteOne({ _id })
            .then(rejectIfEmpty('User not found'))
            .then(status => res.send(status))
            .catch(errorResponse(res))
    )

    return router
}

export function userCRUD() {
    const router = new Router;
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json())

    router.get('/', withPermission('read:user'), (req, res) => {
        const { ...data } = req.body
        User.find()
            .then(status => res.send(status))
            .catch(errorResponse(res))
    })
    router.post('/', withPermission('write:user'), (req, res) => {
        const { ...data } = req.body
        const user = new User(data)
        return user
            .save()
            .then(status => res.send(status))
            .catch(err => res.status(err.status || 500).send(err))
    })


    router.get('/:_id', withPermission('read:user'), (req, res) => {
        const { _id } = req.params
        User.findById(_id)
            .then(rejectIfEmpty('User not found'))
            .then(status => res.send(status))
            .catch(errorResponse(res))
    })

    router.put('/:_id', withPermission('write:user'), (req, res) => {
        const { _id } = req.params
        const { _id: _, ...data } = req.body
        User.findById(_id)
            .then(rejectIfEmpty('User not found'))
            .then(user => Object.assign(user, data))
            .then(user => user.save())
            .then(status => res.send(status))
            .catch(errorResponse(res))
    })

    router.delete('/:_id', withPermission('write:user'), (req, res) => {
        const { _id } = req.params
        User.deleteOne({ _id })
            .then(rejectIfEmpty('User not found'))
            .then(status => res.send(status))
            .catch(errorResponse(res))
    })

    return router
}