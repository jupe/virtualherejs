const {PassThrough} = require('stream');
const readline = require('readline');
const invariant = require('invariant');
const camelCase = require('camelcase');
const _ = require('lodash');

async function parseDeviceListResponse(data) {
    const buf = Buffer.from(data);
    const input = new PassThrough();
    input.end(buf);
    const rl = readline.createInterface({input});
    const response = [];
    let section, match;
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
        match = line.match(/^(\S[\S ]{1,}) \(([\S]{1,})\)/);
        if (match) {
            section = {name: match[1], address: match[2]};
        }
        match = line.match(/^\s+\*?--> ([\S ]+) \(([\S]+)\) ?(\(In use by (.*)\))?/);
        if (match) {
            const device = {name: match[1], address: match[2]};
            if (match[3]) {
                // eslint-disable-next-line prefer-destructuring
                device.inUseBy = match[4];
            } else {
                device.inUseBy = null;
            }
            device.server = section;
            response.push(device);
        }
    }
    return response;
}


async function parseHubListResponse(data) {
    return data.trim().split('\n');
}


async function parseDeviceInfoResponse(data) {
    const rows = data.split('\n');
    const info = {};
    rows.forEach((element) => {
        const row = element;
        let [id, value] = row.split(':');
        if (id && value) {
            id = camelCase(id.trim());
            value = value.trim();
            info[id] = value;
        }
    });
    return info;
}

function parseRequirements(requirements) {
    invariant(requirements, 'requirements should contains something');
    invariant(!_.isEmpty(requirements), 'requirements should not be empty');
    try {
        return JSON.parse(requirements);
    } catch (error) {
        const devices = requirements.split(',');
        return devices.map((device) => {
            const parts = device.split('&');
            const json = {};
            const values = Object.values(parts);
            values.forEach((part) => {
                const [key, value] = part.split('=');
                invariant(!_.isEmpty(key), 'invalid key');
                invariant(!_.isEmpty(value), 'invalid value');
                json[key] = value;
            });
            return json;
        });
    }
}


module.exports = {
    parseHubListResponse,
    parseDeviceListResponse,
    parseDeviceInfoResponse,
    parseRequirements
};
