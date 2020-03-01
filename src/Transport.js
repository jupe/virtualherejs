const {spawn} = require('child_process');
const path = require('path');
const debug = require('debug')('virtualhere:transport');
const {target, platform} = require('../postinstall');

class NotImplemented extends Error {
    constructor() {
        super('not implemented');
    }
}


class Transport {
    async execute(cmd) {
        await this.connect();
        const responsePromise = await Transport._readAll(this._rxStream);
        debug(`request: ${cmd}`);
        await this._write(cmd);
        const response = await responsePromise;
        await this._disconnect();
        debug(`response: ${response}`);
        return response;
    }

    static async _readAll(readStream) {
        let resolver, rejector;
        const responsePromise = new Promise((resolve, reject) => {
            resolver = resolve;
            rejector = reject;
        });
        const onReadable = () => {
            let response = '';
            let chunk;
            // eslint-disable-next-line no-cond-assign
            while ((chunk = readStream.read()) !== null) {
                response += chunk;
            }
            resolver(response.toString());
        };
        debug('Read all data from readStream');
        readStream.once('error', rejector);
        readStream.once('readable', onReadable);
        return responsePromise;
    }

    async connect(iteration = 1) {
        try {
            await this._connect();
        } catch (error) {
            if (error.code === 'ENOENT' && platform !== 'darwin') {
                debug('Virtualhere client daemon not running');
                if (iteration > 0) {
                    await Transport._startService();
                    debug('Retrying connection');
                    await new Promise((resolve) => setInterval(resolve, 1000));
                    return this.connect(iteration - 1);
                }
            }
            throw error;
        }
    }

    async _connect() {
        throw new NotImplemented();
    }

    async _write() {
        throw new NotImplemented();
    }

    async _disconnect() {
        throw new NotImplemented();
    }

    static async _startService() {
        const command = `${target} -n`;
        debug(`Starting virtualhere service: ${command}`);
        const service = spawn(target, ['-n'], {
            detached: true,
            cwd: path.join(__dirname, '..')
        });
        let resolver;
        const promise = new Promise((resolve) => {
            resolver = resolve;
        });
        debug(`Service running with pid: ${service.pid}`);
        // noinspection JSUnusedAssignment
        setTimeout(resolver, 1000);
        return promise;
    }
}

module.exports = Transport;
