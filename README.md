# espruino-i2c-scanner

##### Usage example
```
const I2CScanner = require('https://raw.githubusercontent.com/PaddeK/espruino-i2c-scanner/master/I2CScanner.js');

// Setup I2C
I2C1.setup({scl: B8, sda: B9});

// Start scan
I2CScanner.scan({i2c: I2C1, serial: USB});
```

##### Scan option defaults
```
{
    i2c: null,                      // I2C Port to scan - must be set and defined as I2C Object
    serial: null,                   // Serial Port used for output - must be set and defined as Serial Object
    header: true,                   // Print header/footer of result table
    printAll: true,                 // Print every scan result (true) or only results with a found device (false)
    showProgress: true,             // Show progress indication (true) or suppress progress indication (false)
    findOne: false,                 // Stop scan if a device is found (true) or scan complete address range (false)
    earlyCancel: true,              // Skip speeds after first failure (true) or always try all speeds (false)
    startAddress: 0,                // Start address of address range to scan for devices
    endAddress: 127,                // End address of address range to scan for devices
    speeds: [100, 200, 400, 800],   // Speeds in KHz to scan each address with
    noneFound: '.',                 // Symbol to use to indicate no device was found
    canceled: 'x',                  // Symbol to use to indicate canceled scan
    found: 'V'                      // Symbol to use to indicate device was found
}
```