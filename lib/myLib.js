const { createServer, ServerResponse, IncomingMessage } = require('http');
const Routeable = require("./routeable");
const Router = require('./router');
/**
 * @callback Middleware
 * @param {IncomingMessage} req
 * @param {MyLibResponse} res
 * @param {Function} next
 */


/**
 * @callback RouteHandler
 * @param {MyLib._request} req - The request object
 * @param {MyLibResponse} res - Your custom response object
 * @returns {void}
 */


// TODO: complete get method 
// TODO: complete post method 
// TODO: complete patch method 
// DONE: complete delete method 

class MyLib extends Routeable {
    constructor() {
        super()
        this.server = createServer();
        /**
         * ["GET url",cb]
         */
        this.router = new Router()
        this.routes = this.router.routes;
        this.routesMiddleward = [];
        this.middleWares = [];
        this.server.on("request", (req, res) => {

            const res = this.#prepareResponse(res);
            const request = this.#prepareRequest(req);
            const { route, path } = this.#getCallback(request);
            if (this.notFound(route, path)) return;

            const allMiddlewares = [...this.middleWares, ...route.middleWares];

            const next = (index) => {
                if (index === allMiddlewares.length) {
                    return route.callback(req, res)
                }
                const currentMiddleWare = allMiddlewares[index];
                try {
                    return currentMiddleWare(request, res, () => next(index + 1));
                } catch (error) {
                    console.log(error)
                    return res.status(500).json({ error: "Internal server error" })
                }
            }

            next(0)
        });


    }

    #prepareRequest(req) {
        req.params = this.parseParams(req.url);
        req.query = this.parseQuery(req.url);
        return req;
    }
    #prepareResponse(res) {
        res.json = (obj) => {
            const strObj = JSON.stringify(obj);
            res.setHeader("Content-Type", "application/json")
            res.end(strObj);
        };

        res.send = (data) => {
            res.end(data);
        };
        res.status = this.status.bind(res);
        return res;
    }

    notFound(route, path) {
        if (!route) {
            this._response.status(400).json({ message: `Cannot ${path}` })
            return true;
        }
        return false;
    }
    #getCallback(req) {
        const path = `${req.method} ${req.url}`
        const route = this.routes.get(path);
        return { path, route }

    }


    runRouteMiddleWare(path) {
        const handlers = this.getRouteMiddleWare(path);
        console.log(handlers);
        handlers.forEach(h => h());
    }

    addMilddlewars(arr) {
        if (arr.length === 0) return;
        for (let i = 0; i < arr.length; i++) {
            this.use(arr[i]);
        }
    }
    /**
     * 
     * @param {function[]} args 
     * @returns {{cb: function, handlers: function[]}}
     */
    extractPathAndCb(args) {
        const cb = args.pop();
        if (!cb || typeof cb !== "function") {
            throw new Error('Callback function is required');
        }
        return { cb, handlers: args };
    }
    getRouteMiddleWare(path) {
        const start = this.routesMiddleward.indexOf(path);
        if (start === -1) return [];
        const end = this.routesMiddleward.lastIndexOf(path);

        return this.routesMiddleward.slice(start + 1, end);
    }


    listen(port, cb) {
        this.server.listen(port, cb);
    }

    // TODO: complete the send method 
    send() {

    }

    status(code) {
        this.res.statusCode = code;
        return this
    }

    // TODO: complete teh parseParams method
    parseParams(path) {
        const value = path.split(/^ $/)
    }
    // TODO: complete the parseQuery method
    parseQuery(path) {

    }

    /**
     * 
     * @param {Middleware} path 
     * @returns 
     */
    use(path, fn) {

        if (typeof path === 'function') {
            this.middleWares.push(path);
        };
        if (fn instanceof Router) {
            fn.routes.forEach((handler, routeKey) => {
                const [method, routePath] = routeKey.split(" ");
                const fullPath = `${path}${routePath}`;
                this.routes.set(`${method} ${fullPath}`, handler);
            })
        }
        console.log(this.routes);
    }
}


module.exports = MyLib;