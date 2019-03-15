
import { Router } from 'express'
// import bodyParser from 'body-parser'
// import Axios from 'axios';
import httpProxy from 'http-proxy'

const proxy = httpProxy.createProxyServer({ secure: false })

export default function microServiceMiddleware({ url }, callback) {
    let router = new Router()

    // router.use(bodyParser.json())
    // router.use(bodyParser.urlencoded({ extended: true }))

    callback && callback(router)

    // Reverse Proxy
    router.all('*', (req, res) => {
        return proxy.web(req, res, { target: url, changeOrigin: true }, err => console.error('MS error: ', err))
    })

    return router
}