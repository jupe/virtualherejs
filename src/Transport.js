const {spawn} = require('child_process');
const path = require('path');
const {Readable} = require('stream');
const debug = require('debug')('virtualhere');
const {PromiseSocket, TimeoutError} = require('promise-socket');
const {target} = require('../postinstall');


class Transport {
    constructor() {
        this._rxPipe = '/tmp/vhclient_response';
        this._txPipe = '/tmp/vhclient';
        if (process.platform === 'win32') {
            const winPipe = '\\\\.\\pipe\\vhclient';
            this._rxPipe = winPipe;
            this._txPipe = winPipe;
        }
    }

    static async _startService() {
        const command = `${target} -n`;
        debug(`Startin virtualhere service: ${command}`);
        const service = spawn(target, ['-n'], {
            detached: true,
            cwd: path.join(__dirname, '..')
        });
        let resolver;
        const promise = new Promise((resolve) => {
            resolver = resolve;
        });
        debug(`Service running with pid: ${service.pid}`);
        setTimeout(resolver, 1000);
        return promise;
    }

    async _connect(iteration = 1) {
        debug(`Connect to pipes: ${this._txPipe}:${this._rxPipe}`);
        const createSocket = async () => {
            const socket = new PromiseSocket();
            try {
                socket.stream.on('error', debug);
                socket.setTimeout(5000);
                await socket.connect(this._txPipe);
            } catch (error) {
                if (error instanceof TimeoutError) {
                    debug(`timeout error: ${error}`);
                } else if (error.code === 'ENOENT') {
                    debug('Virtualhere client daemon not running');
                    if (iteration > 0) {
                        socket.end();
                        await Transport._startService();
                        debug('Retrying connection');
                        return this._connect(iteration - 1);
                    }
                } else {
                    debug(`error: ${error}`);
                }
                throw error;
            }
            return socket;
        };
        this._txSocket = await createSocket(this._txPipe);
        if (this._txPipe === this._rxPipe) {
            this._rxSocket = this._txSocket;
        } else {
            this._rxSocket = await createSocket(this._rxPipe);
        }
    }
    async _disconnect() {
        debug('disconnect');
        await this._txSocket.end();
        await this._rxSocket.end();
    }

    static _readAll(socket) {
        const readStream = new Readable().wrap(socket);

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
        readStream.once('error', rejector);
        readStream.once('readable', onReadable);
        return responsePromise;
    }

    async execute(cmd) {
        await this._connect();
        const responsePromise = Transport._readAll(this._rxSocket.socket);
        debug(`request: ${cmd}`);
        await this._txSocket.write(cmd);
        const response = await responsePromise;
        await this._disconnect();
        debug(`response: ${response}`);
        return response;
    }
}

module.exports = Transport;
