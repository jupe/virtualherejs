/* eslint-disable no-console */
const Virtualhere = require('../src/Virtualhere');

(async () => {
    try {
        const vh = new Virtualhere();

        const hubs = await vh.listHub();
        console.log(hubs);

        await vh.addHub(process.env.VIRTUALHERE_HUB);
        await vh.waitDevices();
        let devices = await vh.listDevices();
        console.log(devices.map(obj => obj.name).join(', '));

        const {address} = devices[0];

        const info = await vh.deviceInfo(address);
        console.log(`info: ${JSON.stringify(info)}`);


        await vh.autoUseDevice(address);
        await new Promise(resolve => setTimeout(resolve, 20000));
        await vh.stopUsingAllLocal();


        await vh.removeHub(process.env.VIRTUALHERE_HUB);
        await vh.waitDevices();
        devices = await vh.listDevices();
        console.log(devices.map(obj => obj.address).join(', '));
    } catch (e) {
        console.error(e);
    }
})();
