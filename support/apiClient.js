const { request } = require('@playwright/test');

class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async init() {
        this.requestContext = await request.newContext({ baseURL: this.baseUrl });
    }

    async get(path) {
        return this.requestContext.get(path, {
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    async post(path, body) {
        return this.requestContext.post(path, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: body
        });
    }

    async put(path, body) {
        return this.requestContext.put(path, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: body
        });
    }

    async delete(path) {
        return this.requestContext.delete(path, {
            headers: {
                'Accept': 'application/json'
            }
        });
    }

    async dispose() {
        await this.requestContext.dispose();
    }
}

module.exports = { ApiClient };
