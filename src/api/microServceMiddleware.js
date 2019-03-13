
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
    router.all('*', (req, res) => {
        console.info('MS middleware: acessing ', url)
        return res.send('ok');
        // return proxy.web(req, res, { target: url }, err => console.error('MS error: ', err))
    })

    return router
}