
import { Router } from 'express'
import bodyParser from 'body-parser'
import Axios from 'axios';

export default function microServiceMiddleware({ url }) {
    let router = new Router()

    router.use(bodyParser.json())
    router.use(bodyParser.urlencoded({ extended: true }))

    router.all('*', ({ method, url: route, body: data }, res) => {
        console.log(url + route, method, data)

        Axios({ url: url + route, method })
            .then(({ data, status }) => res.status(status).json(data))
            .catch(({ response }) => res.status(response.status).json(response.data))
    })

    return router
}