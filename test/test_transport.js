const {expect} = require('chai');
const sinon = require('sinon');
const Transport = require('../src/Transport');


describe('Transport', function () {
    it('execute', async function () {
        const transport = new Transport();
        sinon.stub(transport, '_write').resolves('');
        sinon.stub(transport, '_connect').resolves();
        sinon.stub(transport, '_disconnect').resolves();
        sinon.stub(Transport, '_readAll').resolves('resp');
        const resp = await transport.execute('req');
        expect(resp).to.be.equal('resp');
        expect(transport._connect.calledOnce).to.be.true;
        expect(transport._disconnect.calledOnce).to.be.true;
        expect(transport._write.calledOnceWith('req')).to.be.true;
        expect(Transport._readAll.calledOnceWith()).to.be.true;
    });
});
