/**
 * Auth module
 */

import jwt from 'jsonwebtoken'
import { Router } from 'express'
import bodyParser from 'body-parser'

export const login = new Router()
login.use(bodyParser.json());
const {SECRET = 'nosecret', JWT_LIMIT = '1h'} = process.env

export function withAuth(req, res, next) {
    const { Authorization, authorization = Authorization || '' } = req.headers;
    const token = authorization.split(' ')[1]
    if (!token)
        return res.status(401).send({ auth: false, message: 'No auth' });

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err)
            return res.status(500).send({ auth: false, code: err.name,  message: err.message });

        // se tudo estiver ok, salva no request para uso posterior
        req.auth = decoded;
        console.log('Validationg')

        next();
    });
}


login.get('/', withAuth, ({auth}, res) => {
    const {user, role, exp} = auth
    res.send({user, role, exp})
})
login.post('/', (req, res) => {
    console.log('login', req.body)
    const { user, pass, role, invalid = false } = req.body

    if (invalid)
        return res.status(500).send('Login inválido!');

    const id = 1; //esse id viria do banco de dados
    jwt.sign({ user, pass, role }, SECRET, { expiresIn: JWT_LIMIT },
        function (err, token) {
            if (err)
                return res.status(500).send(err.message);

            res.status(200).send({ auth: true, token: token });
        });
})