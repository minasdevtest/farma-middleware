
import { Router } from 'express'
import bodyParser from 'body-parser'
import Axios from 'axios';
import httpProxy from 'http-proxy'

const proxy = httpProxy.createProxyServer()

export default function microServiceMiddleware({ url }, callback) {
    let router = new Router()

    // router.use(bodyParser.json())
    // router.use(bodyParser.urlencoded({ extended: true }))

    callback && callback(router)

    // Reverse Proxy
    router.all('*', (req, res) =>
        proxy.web(req, res, { target: url })
    )

    return router
}