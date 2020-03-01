const debug = require('debug')('virtualhere:transportWin');
const {PromiseSocket, TimeoutError} = require('promise-socket');
const Transport = require('./Transport');


class TransportWin extends Transport {
    constructor() {
        super();
        const winPipe = '\\\\.\\pipe\\vhclient';
        this._rxPipe = winPipe;
        this._txPipe = winPipe;
    }

    async _write(data) {
        return this._txSocket.write(data);
    }

    async _connect() {
        debug(`Connect to pipe: ${this._txPipe}`);
        const createSocket = async () => {
            const socket = new PromiseSocket();
            try {
                socket.stream.on('error', debug);
                socket.setTimeout(5000);
                await socket.connect(this._txPipe);
            } catch (error) {
                if (error instanceof TimeoutError) {
                    debug(`timeout error: ${error}`);
                } else {
                    await socket.end();
                    debug(`error: ${error}`);
                }
                throw error;
            }
            return socket;
        };
        this._txSocket = await createSocket(this._txPipe);
        this._rxSocket = this._txSocket;
    }

    get rxStream() { return this._rxSocket.socket; }

    async _disconnect() {
        debug('disconnect');
        await this._txSocket.end();
        await this._rxSocket.end();
    }

    get _rxPipe() {
        return this._rxSocket.socket;
    }
}

module.export = TransportWin;
