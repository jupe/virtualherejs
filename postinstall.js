/* eslint-disable no-console */
const https = require('https');
const fs = require('fs');
const os = require('os');


const files = {
    win32: {
        source: 'https://virtualhere.com/sites/default/files/usbclient/vhui64.exe',
        target: './bin/win32/vhui64.exe'
    },
    linux: {
        source: 'https://virtualhere.com/sites/default/files/usbclient/vhclientx86_64',
        target: './bin/linux/vhclientx86_64'
    },
    darwin: {
        source: 'https://virtualhere.com/sites/default/files/usbclient/VirtualHere.dmg',
        target: './bin/darwin//VirtualHere.dmg'
    }
};


async function createFolder(dest) {
    try {
        await fs.promises.mkdir(dest);
    } catch (error) {
        if (error.code !== 'EEXIST') {
            console.log(error);
            throw error;
        }
    }
}

const platform = os.platform();
module.exports = files[platform];

async function download(url, dest) {
    if (fs.existsSync(dest)) {
        console.log(`File exists already (${dest}), do nothing`);
        return Promise.resolve();
    }
    const [_, bin, sub] = dest.split('/');
    await createFolder(bin);
    await createFolder(`${bin}/${sub}`);
    console.log(`Downloading file: ${url}`);
    console.log(`Storing file: ${dest}`);

    await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => response.pipe(file));
        file.once('finish', () => file.close());
        file.once('error', reject);
        file.once('end', () => resolve());
    });
    if (platform === 'darwin') {
        console.error(`Please install VirtualHere client manually: ${dest}`)
    }
}

async function main() {
    const {source, target} = files[platform];
    await download(source, target);
    const perm = fs.constants.S_IRUSR | fs.constants.S_IXUSR | fs.constants.S_IRGRP;
    await fs.promises.chmod(target, perm);
    console.log('preinstall ready');
}

if (require.main === module) {
    (async () => await main())();
}
