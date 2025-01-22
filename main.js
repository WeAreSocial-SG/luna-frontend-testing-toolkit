// important settings
const COLORS = {
    positiveGreen: "#99ffc7",
    errorRed: "#ff958a",
};

// setup the qr code scanner
const resultContainer = document.getElementById("qr-reader-results");
let lastResult,
    countResults = 0;
function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);
    }
}
const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 3,
    qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);

// create main update loop
function mainLoop() {
    // render events history
    renderEventHistory();
}
setInterval(mainLoop, 1000 * 0.3);

// rendering
function renderEventHistory() {
    const elEventLogs = document.getElementById("events");
    elEventLogs.innerHTML = "";
    States.eventLogs.forEach((event) => {
        const payloadIsString =
            typeof event.payload === "string" ||
            event.payload instanceof String;
        console.log();
        const payload = payloadIsString
            ? event.payload
            : JSON.stringify(event.payload, null, "\t");
        elEventLogs.innerHTML += `
        <div class="event-log">
            <div class="name-label">
                <div class="event-key">Event: </div>
                ${event.event}
            </div>
            <div class="payload-label">
                <div class="event-key">Payload: </div>
                ${payload}
            </div>
        </div> 
    `;
    });
}

// event callbacks
let sockets = null;
function onConnectButtonClicked() {
    // make UI react to successful connection
    const connectoinLabel = document.getElementById(
        "clientConnectionStatusLabel"
    );
    Sockets.onOpen = () => {
        connectoinLabel.innerHTML = "Connected";
        document.querySelector(
            ".root-client-connection"
        ).style = `background-color: ${COLORS.positiveGreen}`;
    };
    // start the websocket
    const url = `ws://${
        document.getElementById("baseUrlInput").value
    }/websocket`;
    const sockets = new Sockets(url, "engine");
    // add maessage callback
    sockets.onMessageCallback = onEventReceived;
}
function onEventReceived(data) {
    const dataParsed = JSON.parse(data);
    States.eventLogs.push(dataParsed);
}
// proximity slider stuff
document.getElementById("proximitySlider").addEventListener("change", (e) => {
    document.getElementById("proximityLabel").innerHTML =
        document.getElementById("proximitySlider").value;
});
setInterval(() => {
    const url = document.getElementById("baseUrlInput").value;
    const distance = document.getElementById("proximitySlider").value;
    // if checkbox
    if (document.getElementById("proximityCheckbox").checked) {
        fetch(`http://${url}/proximity?distance=${distance}`);
    }
}, 2 * 1000);

// utility
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/*
events csv
playDialogue,lunaFinishedSpeaking,lunaResponded,updateLunaState,triggerVision,qrCodeScanned,showProduct,triggerTelegram,restart,updateTranscriptio,playRecordedAudio,timer,showNotificationAlert,showTooltip,updateLunaMode,updateCurrentSessionId,userReturnedFromPause,register,syncEnvironment
*/
