// important settings
const COLORS = {
    positiveGreen: "#99ffc7",
    errorRed: "#ff958a",
};

// setup the qr code scanner
const resultContainer = document.getElementById("qr-reader-results");
let lastScanTime = 0;
const scanCooldown = 3;
function onScanSuccess(decodedText, decodedResult) {
    const durationSinceLastScan = Math.abs(lastScanTime - Date.now()) / 1000;
    if (durationSinceLastScan > scanCooldown) {
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);
        //make the fetch to server
        const url = document.getElementById("baseUrlInput").value;
        fetch(`http://${url}/?qr-scanner=${decodedText}`);
        lastScanTime = Date.now();
        //trigger ui aniamiton
        triggerConfirmationAnimation("#scannerConfirmation");
    }
}
const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 10,
    qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);

// create main update loop
function mainLoop() {
    renderEventHistory();
    renderStatus();
}
setInterval(mainLoop, 1000 * 0.3);

// rendering
function renderStatus() {
    (async () => {
        const url = document.getElementById("baseUrlInput").value;
        const res = await fetch(`http://${url}/`);
        const resJson = await res.json();
        //  render the important stats
        document.getElementById("modeLabel").innerHTML = resJson.MODE;
        document.getElementById("stateLabel").innerHTML = resJson.STATE;
        // render other stats
        const statusList = document.getElementById("statusList");
        statusList.innerHTML = "";
        const keys = Object.keys(resJson);
        keys.forEach((key) => {
            statusList.innerHTML += `
            <div>
                <strong>${key}</strong>: ${resJson[key]}
            </div>
            `;
        });
    })();
}
function renderEventHistory() {
    const elEventLogs = document.getElementById("events");
    elEventLogs.innerHTML = "";
    States.eventLogs.forEach((event) => {
        // filter the events
        const eventFilters = document
            .getElementById("eventFilter")
            .value.split(",");
        if (eventFilters.includes(event.event)) {
            // check if string or json
            const payloadIsString =
                typeof event.payload === "string" ||
                event.payload instanceof String;
            const payload = payloadIsString
                ? event.payload
                : JSON.stringify(event.payload, null, "\t");
            // render the evetns
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
        }
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
    sockets = new Sockets(url, "engine");
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
        (async ()=>{
            triggerConfirmationAnimation("#proximityConfirmation")
            await fetch(`http://${url}/proximity?distance=${distance}`);
        })();

    }
}, 2 * 1000);
function onSendEventButtonClicked(){
    const eventName = document.getElementById("sendingEvent").value
    const eventPayload = document.getElementById("sendingPayload").value
    const payload = JSON.stringify({
        event: eventName,
        payload: eventPayload
    })
    sockets.send(payload)
}

// utility
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function triggerConfirmationAnimation(elementSelector) {
    const element = document.querySelector(elementSelector);
    element.classList.remove("confirmation-animation");
    element.offsetWidth // force re render
    element.classList.add("confirmation-animation");
}

window.addEventListener("keydown", (e)=>{
    if(e.key ==="1"){
        triggerConfirmationAnimation("#scannerConfirmation")
    }
})

/*
events csv
playDialogue,lunaFinishedSpeaking,lunaResponded,updateLunaState,triggerVision,qrCodeScanned,showProduct,triggerTelegram,restart,updateTranscriptio,playRecordedAudio,timer,showNotificationAlert,showTooltip,updateLunaMode,updateCurrentSessionId,userReturnedFromPause,register,syncEnvironment
*/
