import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC_i7abK_1z71aHY8Ddt6NkTIlPKczzxXM",
    authDomain: "ri-auto.firebaseapp.com",
    databaseURL: "https://ri-auto-default-rtdb.firebaseio.com",
    projectId: "ri-auto",
    storageBucket: "ri-auto.appspot.com",
    messagingSenderId: "92602285970",
    appId: "1:92602285970:web:8e83fe517afc8829c9cb4b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// DOM Elements
const deviceContainer = document.getElementById('deviceContainer');
const addBtn = document.getElementById('addBtn');
const deleteBtn = document.getElementById('deleteBtn');

// Admin Password
const ADMIN_PASSWORD = "9934121310";

// Monitor devices in real-time
function monitorDevices() {
    const devicesRef = ref(db, 'Devices');
    onValue(devicesRef, (snapshot) => {
        deviceContainer.innerHTML = ''; // Clear current devices
        snapshot.forEach((childSnapshot) => {
            const device = childSnapshot.val();
            const sid = childSnapshot.key;
            const name = device?.nameofdevice?.devicename || "Unnamed Device";
            const state = device?.state || false;
            const timers = device?.timers || [];
            createDeviceButtonWithTimers(sid, name, state, timers);
        });
    });
}

// Create device button with timers
function createDeviceButtonWithTimers(sid, name, state, timers = []) {
    // Create button for the device
    const button = document.createElement('button');
    button.classList.add('device-btn');
    button.textContent = name;
    if (state) button.classList.add('glow');

    // Toggle device state
    button.addEventListener('click', () => {
        const newState = !state;
        update(ref(db, `Devices/${sid}`), { state: newState })
            .then(() => console.log(`Device ${sid} updated to state: ${newState}`))
            .catch((error) => alert("Error updating device state: " + error));
    });

    // Timer Management
    const timerDropdown = document.createElement('div');
    timerDropdown.classList.add('timer-dropdown-container');

    const dropdownBtn = document.createElement('button');
    dropdownBtn.textContent = "Manage Timers";
    dropdownBtn.classList.add('dropdown-btn');

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');
    dropdownContent.style.display = 'none';

    dropdownBtn.addEventListener('click', () => {
        dropdownContent.style.display =
            dropdownContent.style.display === 'none' ? 'block' : 'none';
    });

    const timerList = document.createElement('ul');
    timerList.classList.add('timer-list');

    // Populate existing timers
    timers.forEach((timer, index) => {
        const timerItem = document.createElement('li');
        timerItem.classList.add("pings");
        timerItem.textContent = `Start: ${timer.start}, End: ${timer.end}`;

        const deleteTimerBtn = document.createElement('button');
        deleteTimerBtn.textContent = "Delete";
        deleteTimerBtn.classList.add("delete-timer");
        deleteTimerBtn.addEventListener('click', () => {
            timers.splice(index, 1);
            update(ref(db, `Devices/${sid}`), { timers })
                .then(() => {
                    alert("Timer deleted.");
                    timerItem.remove();
                })
                .catch((error) => alert("Error deleting timer: " + error));
        });

        timerItem.appendChild(deleteTimerBtn);
        timerList.appendChild(timerItem);
    });

    dropdownContent.appendChild(timerList);

    // Add new timer
    const addTimerDiv = document.createElement('div');
    const startTimeInput = document.createElement('input');
    startTimeInput.classList.add("start-input");
    startTimeInput.type = 'time';
    const endTimeInput = document.createElement('input');
    endTimeInput.classList.add("end-input");
    endTimeInput.type = 'time';
    const addTimerBtn = document.createElement('button');
    addTimerBtn.classList.add("add-timer");
    addTimerBtn.textContent = "Add";

    addTimerBtn.addEventListener('click', () => {
        const start = startTimeInput.value;
        const end = endTimeInput.value;

        if (start && end) {
            const newTimer = { start, end };
            timers.push(newTimer);
            update(ref(db, `Devices/${sid}`), { timers })
                .then(() => alert("Timer added successfully."))
                .catch((error) => alert("Error adding timer: " + error));
        } else {
            alert("Please enter valid start and end times.");
        }
    });

    addTimerDiv.appendChild(startTimeInput);
    addTimerDiv.appendChild(endTimeInput);
    addTimerDiv.appendChild(addTimerBtn);
    dropdownContent.appendChild(addTimerDiv);

    // Clear all timers
    const clearTimersBtn = document.createElement('button');
    clearTimersBtn.classList.add("clear-time");
    clearTimersBtn.textContent = "Clear";
    clearTimersBtn.addEventListener('click', () => {
        update(ref(db, `Devices/${sid}`), { timers: [] })
            .then(() => {
                alert("All timers cleared.");
                timers.length = 0;
                timerList.innerHTML = '';
            })
            .catch((error) => alert("Error clearing timers: " + error));
    });

    dropdownContent.appendChild(clearTimersBtn);

    // Append dropdown to UI
    timerDropdown.appendChild(dropdownBtn);
    timerDropdown.appendChild(dropdownContent);

    // Device Info
    const deviceInfo = document.createElement('div');
    const sidLabel = document.createElement('span');
    sidLabel.textContent = `SID: ${sid}`;
    deviceInfo.appendChild(button);
    deviceInfo.appendChild(timerDropdown);
    deviceInfo.appendChild(sidLabel);

    deviceContainer.appendChild(deviceInfo);
}

// Add device
addBtn.addEventListener('click', () => {
    const name = prompt("Enter device name:");
    const sid = prompt("Enter SID:");
    const password = prompt("Enter admin password:");

    if (password === ADMIN_PASSWORD) {
        if (name && sid) {
            set(ref(db, `Devices/${sid}`), { nameofdevice: { devicename: name }, state: false })
                .then(() => alert("Device added."))
                .catch((error) => alert("Error adding device: " + error));
        } else {
            alert("Please enter valid device name and SID.");
        }
    } else {
        alert("Incorrect admin password.");
    }
});

// Delete device
deleteBtn.addEventListener('click', () => {
    const sid = prompt("Enter SID of device to delete:");
    const password = prompt("Enter admin password:");

    if (password === ADMIN_PASSWORD) {
        remove(ref(db, `Devices/${sid}`))
            .then(() => alert("Device deleted."))
            .catch((error) => alert("Error deleting device: " + error));
    } else {
        alert("Incorrect admin password.");
    }
});

// Automate devices
function automateDevices() {
    const devicesRef = ref(db, 'Devices');
    onValue(devicesRef, (snapshot) => {
        const currentTime = new Date().toTimeString().slice(0, 5);

        snapshot.forEach((childSnapshot) => {
            const device = childSnapshot.val();
            const sid = childSnapshot.key;
            const timers = device?.timers || [];

            timers.forEach((timer) => {
                if (timer.start === currentTime && !device.state) {
                    update(ref(db, `Devices/${sid}`), { state: true });
                }
                if (timer.end === currentTime && device.state) {
                    update(ref(db, `Devices/${sid}`), { state: false });
                }
            });
        });
    });
}

// Initialize
window.onload = () => {
    monitorDevices();
    setInterval(automateDevices, 1000); // Check every minute
};
