const { createServer, ServerResponse, IncomingMessage } = require('http');

/**
 * @callback Middleware
 * @param {IncomingMessage} req
 * @param {MyLibResponse} res
 * @param {Function} next
 */
/**
 * @callback RouteHandler
 * @param {IncomingMessage} req - The request object
 * @param {MyLibResponse} res - Your custom response object
 * @returns {void}
 */
// TODO: complete get method 
// TODO: complete post method 
// TODO: complete patch method 
// DONE: complete delete method 

class MyLib {
    constructor() {
        this.server = createServer();
        /**
         * ["GET url",cb]
         */
        this.routes = new Map();
        this.routesMiddleward = [];
        this.params = {};
        this.query = {};
        this.middleWares = [];
        this.server.on("request", (request, response) => {
            this._request = request;
            this._response = new MyLibResponse(response);
            const { route, path } = this.#getCallback()
            if (this.notFound(route, path)) return;


            // this.middleWares.forEach(cb => cb());

            route.middleWares.forEach(routeHandler => routeHandler(this._request, this._response));
            route.callback(this._request, this._response);

        });

    }

    notFound(route, path) {
        if (!route) {
            this._response.status(400).json({ message: `Cannot ${path}` })
            return true;
        }
        return false;
    }
    #getCallback() {
        const path = `${this._request.method} ${this._request.url}`
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
            this.beforeEach(arr[i]);
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
    /**
     * @param {string} path
     * @param  {...(Middleware|RouteHandler)} args 
     */
    get(path, ...args) {
        const { cb, handlers } = this.extractPathAndCb(args);
        this.routes.set(`GET ${path}`, {
            callback: cb,
            middleWares: handlers
        });
    }
    post(path, ...args) {
        const { cb, handlers } = this.extractPathAndCb(args);
        this.routes.push(`POST ${path}`, {
            callback: cb,
            middleWares: handlers
        });
    }
    patch(path, ...args) {
        const { cb, handlers } = this.extractPathAndCb(args);
        this.parseParams(path);
        this.routes.push(`PATCH ${path}`, {
            callback: cb,
            middleWares: handlers
        });
    }

    delete(path, ...args) {
        const { cb, handlers } = this.extractPathAndCb(args);
        this.routes.push(`DELETE ${[path]}`, {
            callback: cb,
            middleWares: handlers
        });
    }

    put(path, ...args) {
        const { cb, handlers } = this.extractPathAndCb(args);
        this.routes.push(`PUT ${path}`, {
            callback: cb,
            middleWares: handlers
        });
    }

    listen(port, cb) {
        this.server.listen(port, cb);
    }

    // TODO: complete the send method 
    send() {

    }
    json(obj) {
        const strObj = JSON.stringify(obj);

        this._response.end(strObj);
    }
    // TODO: complete teh parseParams method
    parseParams(path) {
        const value = path.split(/^ $/)
    }
    // TODO: complete the parseQuery method
    parseQuery(path) {

    }

    beforeEach(cb) {
        if (!cb) return;
        console.log(cb)
        if (typeof cb !== 'function') { throw new Error('Middleware should only be functions'); }
        this.middleWares.push(cb);
    }
}

class MyLibResponse {

    /**
     * 
     * @param {ServerResponse<IncomingMessage> & {req: IncomingMessage}} res 
     */
    constructor(res) {
        this.res = res;
        return new Proxy(this.res, {
            get: (target, prop, receiver) => {
                if (prop in target) {
                    return target[prop];
                }
                return this[prop];
            }
        })
    }
    json(obj) {
        const strObj = JSON.stringify(obj);
        this.res.setHeader("Content-Type", "application/json")
        this.res.end(strObj);


    }
    status(code) {
        this.res.statusCode = code;
        return this
    }
}


module.exports = MyLib;