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
        fs.promises.mkdir(dest);
    } catch (error) {
        console.log(error)
        if (error.code !== 'EEXIST') {
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

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => response.pipe(file));
        file.on('finish', () => file.close());
        file.on('error', reject);
        file.on('end', () => resolve());
    });
}

if (require.main === module) {
    const {source, target} = files[platform];
    download(source, target)
        .then(() => fs.promises.chmod(target, fs.constants.S_IXUSR))
        .then(() => {
            console.log('preinstall ready');
        });
}