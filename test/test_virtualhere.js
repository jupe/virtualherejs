const {expect} = require('chai');
const sinon = require('sinon');
const Transport = require('../src/Transport');
const VirtualHere = require('../src/Virtualhere');


describe('VirtualHere', function () {
    it('getClientStatus', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves('<a>b</a>')
        });
        const vh = new VirtualHere({transport});
        const status = await vh.getClientStatus();
        expect(transport.execute.calledOnceWith('GET CLIENT STATE')).to.be.true;
        expect(status).to.be.deep.equal({a: 'b'});
    });
    it('deviceInfo', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves('')
        });
        const vh = new VirtualHere({transport});
        const status = await vh.deviceInfo('123');
        expect(transport.execute.calledOnceWith('DEVICE INFO,123')).to.be.true;
        expect(status).to.be.deep.equal({});
    });
    it('addHub', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves('')
        });
        const vh = new VirtualHere({transport});
        const status = await vh.addHub('abc');
        expect(transport.execute.calledOnceWith('MANUAL HUB ADD,abc:7575')).to.be.true;
        expect(status).to.be.equal('');
    });
    it('removeHub', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves('')
        });
        const vh = new VirtualHere({transport});
        const status = await vh.removeHub('abc');
        expect(transport.execute.calledOnceWith('MANUAL HUB REMOVE,abc:7575')).to.be.true;
        expect(status).to.be.equal('');
    });
    it('listHub', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves('abc')
        });
        const vh = new VirtualHere({transport});
        const status = await vh.listHub();
        expect(transport.execute.calledOnceWith('MANUAL HUB LIST')).to.be.true;
        expect(status).to.be.deep.equal(['abc']);
    });
    it('autoUseDevice', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves()
        });
        const vh = new VirtualHere({transport});
        const status = await vh.autoUseDevice('abc');
        expect(transport.execute.calledOnceWith('AUTO USE DEVICE,abc')).to.be.true;
        expect(status).to.be.undefined;
    });
    it('listDevices', async function () {
        const transport = sinon.createStubInstance(Transport, {
            execute: sinon.stub().resolves('')
        });
        const vh = new VirtualHere({transport});
        const status = await vh.listDevices();
        expect(transport.execute.calledOnceWith('LIST')).to.be.true;
        expect(status).to.be.deep.equal([]);
    });
});
