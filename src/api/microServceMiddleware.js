
import { Router } from 'express'

// import httpProxy from 'http-proxy'
// import expressProxy from 'express-http-proxy'
import proxyMiddleware from 'http-proxy-middleware'

// const proxy = httpProxy.createProxyServer({ secure: false })

export default function microServiceMiddleware({ url: target, method, methods = method && [method], settings = {} }) {
    let router = new Router()

    const config = { changeOrigin: true, target, ...settings }
    let proxy

    if (methods)
        proxy = proxyMiddleware((pathname, req) => {
            return -1 !== methods.findIndex(method => req.method === method)
        }, config)
    else
        proxy = proxyMiddleware(config)


    router.use((req, res, next) => {
        req.originalUrl = req.path
        next()
    }, proxy)


    // Reverse Proxy
    // router.all('*', (req, res) => {
    //     return proxy.web(req, res, { target: url, changeOrigin: true, headers:{'Xorumelos': '*'} }, err => console.error('MS error: ', err))
    // })

    return router
}