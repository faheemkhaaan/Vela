



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

class Routeable {

    constructor() {
        this.routes = new Map();
    }
    /**
     * 
     * @param {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} method 
     * @param {string} path 
     * @param {function[]} args 
     */
    #addRoute(method, path, args) {
        const cb = args.pop();

        this.routes.set(`${method} ${path}`, {
            callback: cb,
            middleWares: args
        })
    }

    /**
       * @param {string} path
       * @param  {...(function|RouteHandler)} args 
       */
    get(path, ...args) {
        this.#addRoute("GET", path, args);
    }
    post(path, ...args) {
        this.#addRoute("POST", path, args);
    }
    patch(path, ...args) {
        this.#addRoute("PATCH", path, args);
    }

    delete(path, ...args) {
        this.#addRoute("DELETE", path, args);
    }
    put(path, ...args) {
        this.#addRoute("PUT", path, args);
    }
}

module.exports = Routeable;