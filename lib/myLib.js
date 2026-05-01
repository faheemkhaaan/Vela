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

            const { route, path } = this.#getCallback(req);
            const response = this.#prepareResponse(res);
            const request = this.#prepareRequest(req, path);
            console.log(path, req.url);
            if (this.notFound(route, path, response)) return;

            const allMiddlewares = [...this.middleWares, ...route.middleWares];

            const next = (index) => {
                if (index === allMiddlewares.length) {
                    return route.callback(request, response)
                }
                const currentMiddleWare = allMiddlewares[index];
                try {
                    return currentMiddleWare(request, response, () => next(index + 1));
                } catch (error) {
                    console.log(error)
                    return res.status(500).json({ error: "Internal server error" })
                }
            }

            next(0)
        });


    }

    #prepareRequest(req, path) {
        req.params = this.parseParams(path, req.url);
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
        res.status = (code) => {
            res.statusCode = code;
            return res;
        }
        return res;
    }

    notFound(route, path, res) {
        if (!route) {
            res.status(400).json({ message: `Cannot ${path}` })
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


    // TODO: complete teh parseParams method
    parseParams(routeTemplate, incomingPath) {
        // 1. Extract the names of the params (e.g., ["userId", "postId"])
        const paramNames = [];
        const nameRegex = /:([^/]+)/g;
        let nameMatch;
        while ((nameMatch = nameRegex.exec(routeTemplate)) !== null) {
            paramNames.push(nameMatch[1]);
        }

        // 2. Create a Regex to match the incoming URL values
        // We replace ":param" with a capturing group "([^/]+)"
        const pathRegexString = routeTemplate
            .replace(nameRegex, '([^/]+)') // Replace :id with group
            .replace(/\//g, '\\/');        // Escape slashes for the regex

        const pathRegex = new RegExp(`^${pathRegexString}$`);
        const valueMatches = incomingPath.match(pathRegex);

        if (!valueMatches) return null; // No match found

        // 3. Map the keys to the values
        // valueMatches[0] is the whole string, so we start at index 1
        const params = {};
        paramNames.forEach((name, index) => {
            params[name] = valueMatches[index + 1];
        });
        console.log(params)
        return params;
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