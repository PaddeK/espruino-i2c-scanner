'use strict';

const
    Version = '0.1.0',
    DefaultOptions = {
        serial: USB,
        printAll: true,
        header: true,
        earlyCancel: true,
        startAddress: 0,
        endAddress: 127,
        speeds: [100, 200, 400, 800]
    };

let I2CScanner;

I2CScanner = function (i2c, options)
{
    this.opts = Object.assign(DefaultOptions, options || {});

    this.i2c = i2c;
    this.opts.speeds = (Array.isArray(this.opts.speeds) ? this.opts.speeds : [this.opts.speeds]).sort();
};

I2CScanner.prototype.scan = function ()
{
    let startTime = Date.now(), count = 0, that = this, header = '',
        pad = (s, p, ps = ' ') => this.opts.serial.print(((new Array(p + 1)).join(ps) + s).slice(-1 * p));

    if (this.opts.header) {
        this.opts.serial.println(' ');
        this.opts.serial.println(`I2C Scanner v${Version}`);
        this.opts.serial.println(' ');
        header += 'TIME DEC  HEX';
        header = this.opts.speeds.reduce((p, speed) => p + ` ${speed}`, header);
        header += ' [KHz]';
        this.opts.serial.println(header);
        pad(' ', header.length + 1, '-');
        this.opts.serial.println(' ');
    }

    for (let address = this.opts.startAddress; address <= this.opts.endAddress; address++) {
        let found = [], fnd = false, printLine = this.opts.printAll;

        this.opts.speeds.some((speed, index) => {
            that.i2c.setup(Object.assign(that.i2c._options, {bitrate: speed * 1000}));

            try {
                that.i2c.writeTo(address, 0);
                found[index] = 'V';
            } catch (e) {
                found[index] = '.';
            }

            fnd |= found[index] === 'V';

            return !fnd && that.opts.earlyCancel;
        });

        count += ~~fnd;
        printLine |= fnd;

        if (printLine) {
            pad(Math.round((Date.now() - startTime) / 1000), 4, ' ');
            pad(`${address}`, 4, ' ');
            pad(`${'0x' + ('0' + (address).toString(16)).slice(-2).toUpperCase()}`, 5, ' ');
            this.opts.speeds.forEach((speed, index) => pad(found[index] || 'x', 4, ' '));
            this.opts.serial.println('');
        }
    }

    if (this.opts.header) {
        pad(' ', header.length + 1, '-');
        this.opts.serial.println('');
        pad(`${count} devices found in ${Math.round((Date.now() - startTime) / 1000)} seconds.`, header.length, ' ');
        this.opts.serial.println(' ');
        this.opts.serial.println(' ');
    }
};


module.exports = I2CScanner;