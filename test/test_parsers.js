const {expect} = require('chai');
const Parsers = require('../src/Parsers');

describe('parsers', function () {
    it('_parseListResponse', async function () {
        const text = 'VirtualHere IPC, below are the available devices:\n' +
            '(Value in brackets = address, * = Auto-Use)\n' +
            '\n' +
            'Raspberry Hub (raspberrypi:7575)\n' +
            '   --> Ultra USB 3.0 (raspberrypi.114) (In-use by you)\n' +
            'QNAP Hub (QNAP:7575)\n' +
            '   --> ADATA USB Flash (QNAP.22)\n' +
            '   --> STORE N GO (QNAP.11)\n' +
            'Synology Hub (synology:17570)\n' +
            '   --> eLicenser (synology.1134)\n' +
            '   --> WIBU-BOX/U (synology.1144)\n' +
            '   --> FT230X Basic UART (synology.1141)\n' +
            '   --> Extreme (synology.1132)\n' +
            '   --> CP2102 USB to UART Bridge Controller (synology.1114)\n' +
            'ASUSTOR Hub (ASUS:7575)\n' +
            'ReadyNAS Hub (readynas:7575)\n' +
            '   --> ASMT1051 (readynas.32)\n' +
            '   --> STORE N GO (readynas.11)\n' +
            '\n' +
            'Auto-Find currently on\n' +
            'Auto-Use All currently off\n' +
            'Reverse Lookup currently off\n' +
            'VirtualHere not running as a service\n';

        const response = await Parsers.parseDeviceListResponse(text);
        expect(response.length).to.be.equal(10);
    });
    it('parseDeviceInfoResponse', async function () {
        const text = 'ADDRESS: nuc.14\n' +
           'VENDOR: Nordic Semiconductor\n' +
           'VENDOR ID: 0x1915\n' +
           'PRODUCT: nRF52 Connectivity\n' +
           'PRODUCT ID: 0xc00a\n' +
           'SERIAL: FA2BC41052F6\n' +
           'IN USE BY: NO ONE';
        const response = await Parsers.parseDeviceInfoResponse(text);
        expect(response).to.be.deep.equal({
            address: 'nuc.14',
            vendor: 'Nordic Semiconductor',
            vendorId: '0x1915',
            productId: '0xc00a',
            product: 'nRF52 Connectivity',
            serial: 'FA2BC41052F6',
            inUseBy: 'NO ONE'
        });
    });
    it('parseHubListResponse', async function () {
        expect(await Parsers.parseHubListResponse('a\nb'))
            .to.be.deep.equal(['a', 'b']);
    });
    it('parseRequirements', function () {
        expect(Parsers.parseRequirements('[]'))
            .to.be.deep.equal([]);
        expect(Parsers.parseRequirements('type=phone'))
            .to.be.deep.equal([{type: 'phone'}]);
        expect(Parsers.parseRequirements('type=phone,type=phone'))
            .to.be.deep.equal([{type: 'phone'}, {type: 'phone'}]);
    });
});
