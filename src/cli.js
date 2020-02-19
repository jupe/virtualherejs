#!/usr/bin/env node
const fs = require('fs');
// 3rd party modules
const debug = require('debug')('client:app');
const yargs = require('yargs');
const Virtualhere = require('./Virtualhere');
const Lockable = require('./Lockable');
const {parseRequirements} = require('./Parsers');

async function main() {
    const {argv} = yargs
        .option('hub', {
            type: 'string',
            required: true,
            nargs: 1,
            coerce: (arg) => {
                const [address, port = 7575] = arg.split(':');
                return {address, port};
            },
            describe: 'Virtualhere hub address. <address>(:<port>)'
        })
        .option('lock', {
            type: 'string',
            nargs: 1,
            default: '.virtualhere.lock',
            describe: 'device map file'
        })
        .option('deviceMap', {
            type: 'string',
            nargs: 1,
            coerce: arg => JSON.parse(fs.readFileSync(arg)),
            describe: 'device map file'
        })
        .command('allocate', 'allocate devices', yarg =>
            yarg.option('requirements', {
                type: 'string',
                required: true,
                nargs: 1,
                coerce: arg => parseRequirements(arg),
                describe: 'requirements as JSON'
            }))
        .command('release', 'release allocated resources', yarg => yarg)
        .usage('Usage example:\n' +
            'vh allocate --hub vh-server-address --requirements type=phone\n' +
            'vh release --hub vh-server-address\n')
        .strict()
        .help();
    let killing;
    const deviceMap = argv.deviceMap || [];

    const vh = new Virtualhere({deviceMap});
    const lockable = new Lockable(vh, argv.lock);

    async function tearDown() {
        if (vh && !killing) {
            debug('tearDown');
            killing = true;
            try {
                await lockable.unlockAll();
                await vh.removeHub(argv.hub.address, argv.hub.port);
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.error(error);
                }
            }
            process.exit(1);
        }
    }
    process.on('SIGINT', () => {
        debug('Caught interrupt signal');
        tearDown();
    });

    try {
        // Add virtualhere hub
        await vh.addHub(argv.hub.address, argv.hub.port);
        // wait until devices are available
        await vh.waitDevices();
        if (argv._[0] === 'release') {
            debug('releasing..');
            await lockable.unlockAll();
        } else {
            debug('allocating..');
            const allocated = await lockable.lockAll(argv.requirements);
            // eslint-disable-next-line no-console
            console.log(allocated);
        }
        process.exit(0);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error: ${error.message}`);
        await tearDown();
    }
}

if (require.main === module) {
    (() => main())();
}
