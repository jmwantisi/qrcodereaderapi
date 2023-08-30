import HID from 'node-hid';
import fs from 'fs'

let rawdata = fs.readFileSync('hid_report.json');
let hid = JSON.parse(rawdata);


async function detectMunbynScanners() {
  return new Promise((resolve, reject) => {
    try {
      const devices = HID.devices();

      const UsbDevices = devices.filter((device) => device.manufacturer);

      //UsbDevices.map((device, index) => console.log(`All USB Devices detected number ${index} :`, device))

      const PRODUCTS = ['USBKey Module', 'HIDKeyBoard']

      const keyboards = devices.filter((device) => PRODUCTS.includes(device.product)); // need to update for each manufacture scanner

      let result = ""

      if (keyboards.length === 0) {
        console.log('No Keyboards/Scanners Found.');
        result = 'No Keyboards Found.'
      } else {
        console.log('HID device connected!!!\n');
        result = keyboards
        resolve(result)
      }
    } catch (error) {
      console.log(error)
    }

  })
}

export default function NIDQRCodeReader() {
  return new Promise(async (resolve, reject) => {
    const qrDeviceSettings = await detectMunbynScanners()

    if (qrDeviceSettings.length == 0)
      return

    const { vendorId, productId } = qrDeviceSettings[0]
    // Find the QR code scanner by vendorId and productId
    const hidDevice = new HID.HID(vendorId, productId);

    console.log(`HID device with Vendor ID: ${vendorId}, Product ID: ${productId} is now Connected and listening for QR Scan Events...`)


    const INGORE = [
      "KEY_NONE",
      "KEY_ENTER",
      "KEY_BACKSPACE",
      "KEY_LEFTSHIFT",
      "KEY_RIGHTSHIFT",
      undefined,
      "KEY_MOD_LSHIFT",
      "KEY_MOD_RSHIFT"
    ]

    let receivedData = '';
    let collection = []
    hidDevice.on('data', data => {
      // Assuming data is a Buffer received from the scanner
      const dataString = data.toString("utf8").trim();
      receivedData += dataString;

      let index = 0
      for (const byte of data) {
        const hexValue = byte.toString(16).padStart(2, '0');
        const hidsValue = hid[`0x${hexValue}`][0]

        if ((index == 0)) { // shift key pressed
          const value = data[2].toString(16).padStart(2, '0');
          hidsValue == 'KEY_MOD_LSHIFT' || hidsValue == 'KEY_MOD_RSHIFT' ? collection.push(hid[`0x${value}`][1]) : ''
        }

        const isShiftNotPressed = data[0].toString(16).padStart(2, '0');
        if (isShiftNotPressed == 0) {
          const value = data[2].toString(16).padStart(2, '0');
          if (hid[`0x${value}`][0] == "KEY_SPACE") {
            index == 2 && !INGORE.includes(hidsValue) ? collection.push(" ") : ''
          } else {
            index == 2 && !INGORE.includes(hidsValue) ? collection.push(hid[`0x${value}`][0]) : ''
          }
        }

        index = index + 1
        if (hidsValue == "KEY_ENTER") {
          const filteredArray = collection.filter(item => item !== undefined);
          console.log("\n")
          console.log(`Scanned: ${filteredArray.join("")}`)
          // call API here
          collection = []
          //send resolve before clear
        }
      }

    });

    // Close the HID device on program exit
    process.on('SIGINT', () => {
      hidDevice.close();
      process.exit();
    });
  })
}

NIDQRCodeReader()

