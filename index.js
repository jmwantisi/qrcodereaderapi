const readline = require('readline');

// Create the readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to handle scanned data
function handleScannedData(data) {
  // Process the scanned data here
  // emit event here
  console.log('Scanned data:', data);
}

// Start listening for data from the handheld scanner
rl.on('line', handleScannedData);

// Display a message to inform the user
console.log('Application started, keep the mouse cursor in the terminal');

// Close the readline interface when the program exits
rl.on('close', function () {
  rl.removeAllListeners('line');
});

// Handle any uncaught exceptions
process.on('uncaughtException', function (err) {
  console.error('Uncaught exception: ', err);
  rl.close();
  process.exit(1);
});
