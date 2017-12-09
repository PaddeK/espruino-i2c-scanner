'use strict';

const
    Progress = '|/-\\',
    Version = '0.1.0',
    Defaults = {
        i2c: null,
        serial: null,
        printAll: true,
        header: true,
        findOne: false,
        earlyCancel: true,
        startAddress: 0,
        endAddress: 127,
        speeds: [100, 200, 400, 800],
        showProgress: true,
        noneFound: '.',
        canceled: 'x',
        found: 'V'
    };

module.exports.scan = function (options)
{
    let prog, pad, startTime = Date.now(), count = 0, i = 0, header = '', o = Object.assign(Defaults, options || {});

    o.speeds = (Array.isArray(o.speeds) ? o.speeds : [o.speeds]).sort();

    if (!(o.serial instanceof Serial) || !(o.i2c instanceof I2C)) {
        throw new Error('Please define Options.serial and Options.i2c appropriately');
    }

    prog = () => o.serial.print(`\r${Progress[i = ++i % Progress.length]}${(new Array(header.length)).join(' ')}`);
    pad = (s, p, ps = ' ') => o.serial.print(((new Array(p + 1)).join(ps) + s).slice(-1 * p));

    header += 'TIME DEC  HEX';
    header = o.speeds.reduce((p, speed) => p + ` ${speed}`, header);
    header += ' [KHz]';

    if (o.header) {
        o.serial.println(' ');
        o.serial.println(`I2C Scanner v${Version}`);
        o.serial.println(' ');
        o.serial.println(`Legend: ${o.noneFound} = none found, ${o.canceled} = canceled, ${o.found} = found`);
        o.serial.println(' ');
        o.serial.println(header);
        pad(' ', header.length + 1, '-');
        o.serial.println(' ');
    }

    for (let address = o.startAddress; address <= o.endAddress;) {
        let found = [], fnd = false, printLine = o.printAll;

        o.speeds.some((speed, index) => {
            o.showProgress && prog();
            o.i2c.setup(Object.assign(o.i2c._options, {bitrate: speed * 1000}));

            try {
                o.i2c.writeTo(address, 0);
                found[index] = 'V';
            } catch (e) {
                found[index] = '.';
            }

            fnd |= found[index] === 'V';

            return !fnd && o.earlyCancel;
        });

        count += ~~fnd;
        printLine |= fnd;

        if (printLine) {
            o.serial.print('\r');
            pad(Math.round((Date.now() - startTime) / 1000), 4, ' ');
            pad(`${address}`, 4, ' ');
            pad(`${'0x' + ('0' + (address).toString(16)).slice(-2).toUpperCase()}`, 5, ' ');
            o.speeds.forEach((speed, index) => pad(found[index] || 'x', 4, ' '));
            o.serial.println('');
        }

        address += o.findOne && fnd ? o.endAddress : 1;
    }

    if (o.header) {
        pad(' ', header.length + 1, '-');
        o.serial.println('');
        pad(`${count} devices found in ${Math.round((Date.now() - startTime) / 1000)} seconds.`, header.length, ' ');
        o.serial.println(' ');
        o.serial.println(' ');
    }
};