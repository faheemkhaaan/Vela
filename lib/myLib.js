const { createServer, ServerResponse, IncomingMessage } = require('http');;




class MyLib {
    constructor() {
        this.server = createServer();
        /**
         * ["GET url",cb]
         */
        this.callbacks = [];
        this.params = {};
        this.query = {};
        this.server.on("request", (request, response) => {
            this._request = request;
            this._response = new MyLibResponse(response);
            const { callback, path } = this.#getCallback()
            let body = '';



            request.on('data', (data) => {

                console.log(data.toString("utf-8"));
            });

            if (callback) {
                callback(this._request, this._response);
                return;
            } else {
                this._response.status(400).json({ message: `Cannot ${path}` })
                return;
            }

        });

    }
    #getCallback() {
        const path = `${this._request.method} ${this._request.url}`
        const foundPathIndex = this.callbacks.indexOf(path);
        const callback = foundPathIndex !== -1 ? this.callbacks[foundPathIndex + 1] : null;
        return { path, callback };

    }

    get response() {
        return new Proxy(this._response, (object) => {

            console.log(object);
            return this._response;
        })
    }

    get(path, cb) {
        this.callbacks.push(`GET ${path}`, cb);
    }
    post(path, cb) {
        this.callbacks.push(`POST ${path}`, cb);
    }
    patch(path, cb) {
        this.parseParams(path);
        this.callbacks.push(`PATCH ${path}`, cb);
    }

    delete(path, cb) {
        this.callbacks.push(`DELETE ${[path]}`, cb);
    }
    listen(port, cb) {
        this.server.listen(port, cb);
    }
    send() {

    }
    json(obj) {
        const strObj = JSON.stringify(obj);

        this._response.end(strObj);
    }
    parseParams(path) {
        const value = path.split(/^ $/)
    }
    parseQuery(path) {

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