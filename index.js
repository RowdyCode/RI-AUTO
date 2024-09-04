url = "https://home-automation-p777.vercel.app"

// Function to toggle a device on/off
// Function to toggle a device on/off based on its current state
function toggleDevice(device) {
    fetch(`${url}/device/${device}`)
        .then(response => response.json())
        .then(data => {
            const currentState = data[device];
            const newState = !currentState;

            return fetch(`${url}/device/${device}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state: newState })
            });
        })
        .then(response => response.json())
        .then(data => {
            updateStatus(device, data[device]);
        })
        .catch(error => {
            console.error(`Failed to toggle device "${device}":`, error);
        });
}


// Function to load devices on page load
// Function to load devices on page load
function loadDevices() {
    fetch(`${url}/devices`)
        .then(response => response.json())
        .then(devices => {
            const controlsDiv = document.getElementById('controls');
            controlsDiv.innerHTML = ''; // Clear any existing content

            devices.forEach(device => {
                const deviceDiv = document.createElement('div');
                deviceDiv.className = 'device';

                const deviceNameP = document.createElement('p');
                deviceNameP.textContent = device.charAt(0).toUpperCase() + device.slice(1);

                const toggleButton = document.createElement('button');
                toggleButton.textContent = `Toggle ${deviceNameP.textContent}`;
                toggleButton.onclick = () => toggleDevice(device); // Toggle device on button click

                const statusP = document.createElement('p');
                statusP.className = 'status';
                statusP.id = `${device}-status`;
                statusP.textContent = 'Status: Loading...';

                deviceDiv.appendChild(deviceNameP);
                deviceDiv.appendChild(toggleButton);
                deviceDiv.appendChild(statusP);

                controlsDiv.appendChild(deviceDiv);

                // Fetch and update the device's state but do not toggle it
                getDeviceState(device);
            });
        })
        .catch(error => {
            console.error('Error loading devices:', error);
            alert('Failed to load devices.');
        });
}

// Function to update the status of a device without toggling it
async function getDeviceState(device) {
    try {
        const response = await fetch(`${url}/device/${device}`);
        const data = await response.json();
        updateStatus(device, data[device]);
    } catch (error) {
        console.error(`Failed to get the state of device "${device}":`, error);
    }
}

// Load devices on page load
window.onload = loadDevices;

// Function to update the status of a device
async function getDeviceState(device) {
    try {
        const response = await fetch(`${url}/device/${device}`);
        const data = await response.json();
        updateStatus(device, data[device]);
    } catch (error) {
        console.error(`Failed to get the state of device "${device}":`, error);
    }
}

// Function to update the status of a device
function updateStatus(device, status) {
    const statusElement = document.getElementById(`${device}-status`);
    if (statusElement) {
        statusElement.innerText = `Status: ${status ? 'On' : 'Off'}`;
    } else {
        console.error(`Status element for device "${device}" not found.`);
    }
}

// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.continuous = true; // Run continuously

recognition.onresult = (event) => {
    const command = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
    console.log('Command:', command);

    if (command.startsWith('ghost')) {
        const parsedCommand = command.replace('ghost', '').trim();
        handleVoiceCommand(parsedCommand);
    } else {
        document.getElementById('status').textContent = 'Waiting for command...';
    }
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    document.getElementById('status').textContent = `Error: ${event.error}`;
};

recognition.onend = () => {
    console.log('Speech recognition service disconnected, restarting...');
    document.getElementById('status').textContent = 'Restarting speech recognition...';
    recognition.start(); // Restart recognition if it stops
};

recognition.start();
document.getElementById('status').textContent = 'Listening... Say "ghost" to start a command.';

// Function to turn a device on or off based on the desired state
async function setDeviceState(device, desiredState) {
    try {
        // Fetch the current state of the device
        const response = await fetch(`${url}/device/${device}`);
        const data = await response.json();
        const currentState = data[device];

        // Compare the current state with the desired state
        if (currentState === desiredState) {
            console.log(`Device "${device}" is already ${desiredState ? 'On' : 'Off'}. No action taken.`);
            document.getElementById('status').textContent = `Device "${device}" is already ${desiredState ? 'On' : 'Off'}.`;
        } else {
            console.log(`Toggling device "${device}" to ${desiredState ? 'On' : 'Off'}.`);
            await toggleDevice(device);
            document.getElementById('status').textContent = `Device "${device}" has been turned ${desiredState ? 'On' : 'Off'}.`;
        }
    } catch (error) {
        console.error(`Failed to set state for device "${device}":`, error);
        document.getElementById('status').textContent = `Failed to set state for device "${device}".`;
    }
}

// Updated handleVoiceCommand function to use setDeviceState
async function handleVoiceCommand(command) {
    const actionMatch = command.match(/(on|off)/);
    const deviceMatch = command.match(/light|fan/); // Add more device names as needed

    if (actionMatch && deviceMatch) {
        const action = actionMatch[0];
        const device = deviceMatch[0];

        const desiredState = action === 'on'; // true for 'on', false for 'off'
        console.log(`Performing action: ${action} on device: ${device}`);

        // Use the setDeviceState function to manage device state
        await setDeviceState(device, desiredState);
        getDeviceState(device); // Update the device status on the page
    } else {
        console.log('Unknown command:', command);
        document.getElementById('status').textContent = 'Unknown command';
    }
}

