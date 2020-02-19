/* eslint-disable no-console */
const https = require('https');
const fs = require('fs');
const os = require('os');


const files = {
    win32: {
        source: 'https://virtualhere.com/sites/default/files/usbclient/vhui64.exe',
        target: 'bin/win32/vhui64.exe'
    },
    linux: {
        source: 'https://virtualhere.com/sites/default/files/usbclient/vhclientx86_64',
        target: 'bin/linux/vhclientx86_64'
    },
    darwin: {
        source: 'https://virtualhere.com/sites/default/files/usbclient/VirtualHere.dmg',
        target: 'bin/darwin//VirtualHere.dmg'
    }
};

const platform = os.platform();
module.exports = files[platform];

function download(url, dest, cb) {
    if (fs.existsSync(dest)) {
        console.log(`File exists already (${dest}), do nothing`);
        cb();
        return;
    }
    console.log(`Downloading file: ${url}`);
    console.log(`Storing file: ${dest}`);
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);
    });
    file.on('finish', () => {
        file.close();
    });
    file.on('end', () => {
        fs.chmod(dest, fs.constants.S_IXUSR, cb);
    });
}

if (require.main === module) {
    const {source, target} = files[platform];
    download(source, target, () => {
        console.log('preinstall ready');
    });
}