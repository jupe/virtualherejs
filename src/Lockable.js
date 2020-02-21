const fs = require('fs');
const Promise = require('bluebird');
const invariant = require('invariant');
const debug = require('debug')('Lockable');
const matches = require('lodash/matches');
const merge = require('lodash/merge');
// eslint-disable-next-line no-unused-vars
const VirtualHere = require('./Virtualhere');


class Lockable {
    /**
     * Manage Lockable resources
     * @param {VirtualHere} vhere instance
     * @param {string} lockFile lock file
     */
    constructor(vhere, lockFile) {
        this._vh = vhere;
        this._lockFile = lockFile;
    }

    async _lock(devices, requirement) {
        const device = devices.find(matches(requirement));
        invariant(device, 'device not found');
        debug(JSON.stringify(device));
        await this._vh.autoUseDevice(device.address);
        return device;
    }
    async _unlock({address, name}) {
        debug(`Release: ${name}`);
        await this._vh.stopUsingADevice(address);
    }

    async _readLockFile() {
        debug(`Reading lock file: ${this._lockFile}`);
        const data = await fs.promises.readFile(this._lockFile);
        return JSON.parse(data.toString());
    }

    /**
     * lock multiple devices based on requirements
     * @param {array} requirements requirements as array
     * @returns {Promise<[object]>} List of allocated devices
     */
    async lockAll(requirements) {
        const devices = await this._vh.listDevices();
        requirements.map(obj => merge(obj, {inUseBy: undefined}));
        debug(`devices: ${devices.map(obj => obj.name).join(', ')}`);
        debug(`Requirements: ${JSON.stringify(requirements)}`);
        const allocated = await Promise.mapSeries(requirements, req => this._lock(devices, req));
        const names = allocated.map(obj => obj.name).join(', ');
        debug(`Allocated: ${names}. lock file: ${this._lockFile}`);
        await fs.promises.writeFile(this._lockFile, JSON.stringify(allocated));
        return allocated;
    }

    /**
     * Unlock all allocated resources
     * @returns {Promise<void>} resolves when success, otherwise rejects
     */
    async unlockAll() {
        const devices = await this._readLockFile();
        await Promise.mapSeries(devices, this._unlock.bind(this));
        await fs.promises.unlink(this._lockFile);
        debug('All resources released');
    }
}

module.exports = Lockable;
