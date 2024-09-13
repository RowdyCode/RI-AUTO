
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, set, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyC_i7abK_1z71aHY8Ddt6NkTIlPKczzxXM",
    authDomain: "ri-auto.firebaseapp.com",
    databaseURL: "https://ri-auto-default-rtdb.firebaseio.com",
    projectId: "ri-auto",
    storageBucket: "ri-auto.appspot.com",
    messagingSenderId: "92602285970",
    appId: "1:92602285970:web:8e83fe517afc8829c9cb4b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();

const deviceContainer = document.getElementById('deviceContainer');
const addBtn = document.getElementById('addBtn');
const deleteBtn = document.getElementById('deleteBtn');

// Function to monitor and display devices dynamically
function monitorDevices() {
    const devicesRef = ref(db, 'Devices');
    onValue(devicesRef, (snapshot) => {
        deviceContainer.innerHTML = ''; // Clear the current devices
        snapshot.forEach((childSnapshot) => {
            const device = childSnapshot.val();
            const sid = childSnapshot.key;
            createDeviceButton(sid, device.nameofdevice?.devicename || "Unnamed", device.state);
        });
    });
}

// Function to create device buttons with name and sid display
function createDeviceButton(sid, name, state) {
    const button = document.createElement('button');
    button.classList.add('device-btn');
    button.textContent = name;
    if (state) {
        button.classList.add('glow');
    }

    // Toggle light state on click
    button.addEventListener('click', () => {
        const newState = !button.classList.contains('glow');
        update(ref(db, "Devices/" + sid), { state: newState });
    });

    // Add button and device details to the container
    const deviceInfo = document.createElement('div');
    deviceInfo.classList.add('device-info');
    deviceInfo.appendChild(button);

    const sidLabel = document.createElement('span');
    sidLabel.classList.add('sid-label');
    sidLabel.textContent = `SID: ${sid}`;
    deviceInfo.appendChild(sidLabel);

    deviceContainer.appendChild(deviceInfo);
}

// Add/Delete device
addBtn.addEventListener('click', () => {
    const name = prompt("Enter Device Name:");
    const sid = prompt("Enter SID:");
    const pass = prompt("Enter Admin Password:");
    if (sid && name && pass) {
        if (pass == 9934121310) {
            if (sid.length <= 8) {
                const devicesRef = ref(db, "Devices/" + sid);
                set(devicesRef, {
                    nameofdevice: { devicename: name },
                    state: false
                })
                    .then(() => {
                        alert("Device added.");
                    })
                    .catch((error) => {
                        alert("Error: " + error);
                    });
            }
        }
        else{
            alert("Enter the Correct pass to do so")
        }
    }
});

// Delete device
deleteBtn.addEventListener('click', () => {
    const sid = prompt("Enter SID of device to delete:");
    const password = prompt("Enter Admin Password:");
    if (sid) {
        if(password == 9934121310){
            
            const deviceRef = ref(db, "Devices/" + sid);
            remove(deviceRef)
                .then(() => {
                    alert("Device deleted.");
                })
                .catch((error) => {
                    alert("Error: " + error);
                });
            }
        }
 });

// Monitor devices on page load
window.onload = monitorDevices;
