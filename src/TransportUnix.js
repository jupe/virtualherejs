const fs = require('fs');
const Transport = require('./Transport');
const debug = require('debug')('virtualhere:transportUnix');


class TransportUnix extends Transport {
    constructor() {
        super();
        this._rxPipe = '/tmp/vhclient_response';
        this._txPipe = '/tmp/vhclient';
    }

    async _connect() {
        debug(`Connect to pipes: ${this._txPipe}:${this._rxPipe}`);

        async function waitReady(stream) {
            let resolver, rejecter;
            const ready = new Promise((resolve, reject) => {
                resolver = resolve;
                rejecter = reject;
            });
            stream.once('ready', resolver);
            stream.once('error', rejecter);
            return ready;
        }
        this._rxStream = fs.createReadStream(this._rxPipe);
        await waitReady(this._rxStream);
        this._txStream = fs.createWriteStream(this._txPipe);
        await waitReady(this._txStream);
    }

    async _write(data) {
        return this._txStream.write(data);
    }

    async _disconnect() {
        debug('disconnect');
        await this._rxStream.close();
        await this._txStream.close();
    }
}

module.exports = TransportUnix;
