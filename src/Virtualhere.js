// 3rd party modules
const invariant = require('invariant');
const debug = require('debug')('virtualhere');
const {parseStringPromise} = require('xml2js');
const promiseRetry = require('promise-retry');
const Promise = require('bluebird');
const merge = require('lodash/merge');
const set = require('lodash/set');

const Transport = require('./Transport');
const Parsers = require('./Parsers');


class Virtualhere {
    constructor({transport = new Transport(), deviceMap = []}) {
        this._transport = transport;
        this._deviceMap = deviceMap;
    }

    async getClientStatus() {
        const command = 'GET CLIENT STATE';
        const data = await this._transport.execute(command);
        return parseStringPromise(data);
    }

    async deviceInfo(address) {
        const command = `DEVICE INFO,${address}`;
        const data = await this._transport.execute(command);
        return Parsers.parseDeviceInfoResponse(data);
    }

    async addHub(address, port = 7575) {
        invariant(address, 'invalid address');
        invariant(port, 'invalid port');
        const command = `MANUAL HUB ADD,${address}:${port}`;
        return this._transport.execute(command);
    }

    async removeHub(address, port = 7575) {
        const command = `MANUAL HUB REMOVE,${address}:${port}`;
        return this._transport.execute(command);
    }

    async listHub() {
        const command = 'MANUAL HUB LIST';
        const response = await this._transport.execute(command);
        return Parsers.parseHubListResponse(response);
    }

    async removeHubAll() {
        const command = 'MANUAL HUB REMOVE ALL';
        return this._transport.execute(command);
    }

    async autoUseDevice(address) {
        debug(`autoUseDevice: ${address}`);
        const command = `AUTO USE DEVICE,${address}`;
        return this._transport.execute(command);
    }

    async stopUsingAllLocal() {
        debug('stopUsingAllLocal');
        const command = 'STOP USING ALL LOCAL';
        return this._transport.execute(command);
    }

    async stopUsingADevice(address) {
        debug(`stopUsingADevice(${address})`);
        const command = `STOP USING,${address}`;
        return this._transport.execute(command);
    }

    async listDevices() {
        debug('listDevices()');
        const command = 'LIST';
        const response = await this._transport.execute(command);
        const devices = await Parsers.parseDeviceListResponse(response);
        await Promise.map(devices, async (obj) => {
            const info = await this.deviceInfo(obj.address);
            merge(obj, info);
            if (obj.inUseBy === 'NO ONE') {
                set(obj, 'inUseBy', undefined);
            }
        });
        return devices.map(this._deviceMapper.bind(this));
    }

    _deviceMapper(deviceObj) {
        let details = this._deviceMap.find((obj) => obj.serial === deviceObj.serial);
        if (details) {
            merge(deviceObj, details);
        }
        details = this._deviceMap.find((obj) => obj.name === deviceObj.name);
        if (details) {
            merge(deviceObj, details);
        }
        return deviceObj;
    }

    async waitDevices() {
        debug('wait devices');
        return promiseRetry(async (retry, number) => {
            debug(`attempt number: ${number} for waiting devices`);
            const list = await this.listDevices();
            debug(`found ${list.length} devices`);
            if (list.length > 0) {
                return true;
            }
            return retry();
        });
    }
}

module.exports = Virtualhere;
