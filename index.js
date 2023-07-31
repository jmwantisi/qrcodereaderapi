const HID = require('node-hid');

async function detectMunbynScanners() {
  return new Promise((resolve, reject) => {
    const devices = HID.devices();

    const UsbDevices = devices.filter((device) => device.manufacturer);

    UsbDevices.map((device, index) => console.log(`Devices detected number ${index} :` , device))

    const munbynScanners = devices.filter((device) => device.manufacturer === 'USBKey Chip'); // need to update for each manufacture scanner

    let result = ""

    if (munbynScanners.length === 0) {
      console.log('No MUNBYN QR code scanner found.');
      result = 'No MUNBYN QR code scanner found.'
    } else {
      console.log('Detected MUNBYN QR code scanners:');
      munbynScanners.forEach((scanner, index) => {
        console.log(`Scanner ${index + 1}:`);
        console.log(`  Vendor ID: ${scanner.vendorId}`);
        console.log(`  Product ID: ${scanner.productId}`);
        console.log(`  Path: ${scanner.path}`);
        console.log(`  Serial Number: ${scanner.serialNumber}`);
      });

      result = munbynScanners
    }
    resolve(result)
  })
}

detectMunbynScanners()

// Replace the vendorId and productId with the appropriate values for your QR code scanner
const vendorId = 8208; // Replace with the actual vendor ID of your scanner
const productId = 30264; // Replace with the actual product ID of your scanner

// Find the QR code scanner by vendorId and productId
const qrCodeScanner = new HID.HID(vendorId, productId);

console.log(qrCodeScanner)

// Function to handle data from the QR code scanner
function handleData(data) {
  console.log("Event Called")
  console.log(data)
  const qrCodeData = data.toString('utf8').trim();
  console.log('QR Code data:', qrCodeData);
}

console.log(qrCodeScanner.on('data', () => {}))

// Listen for data events from the scanner
qrCodeScanner.on('data', handleData);

// Handle errors
qrCodeScanner.on('error', (err) => {
  console.error('Error:', err.message);
});

// Handle the 'end' event
qrCodeScanner.on('end', () => {
  console.log('Connection to the QR code scanner closed.');
});

// Handle any uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error('Uncaught exception:', err);
  qrCodeScanner.close();
  process.exit(1);
});
