// important settings
const COLORS = {
    positiveGreen: "#99ffc7",
    errorRed: "#ff958a",
    modeBlue: "#bddcff",
    defaultGrey: "#d1d1d1",
    conversationGreen: "#affac2",
};
const eventColors = {
    playDialogue: COLORS.conversationGreen,
    updateTranscription: COLORS.conversationGreen,
    updateLunaMode: COLORS.modeBlue,
    updateLunaState: COLORS.modeBlue,
    playRecordedAudio: COLORS.conversationGreen,
};
const maxEventBacklog = 20;

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
        fetch(`http://${url}/qr-scanner?payload=${decodedText}`);
        lastScanTime = Date.now();
        //trigger ui aniamiton
        triggerConfirmationAnimation(".root-qr-scanner");
    }
}
const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", {
    fps: 10,
    qrbox: 250,
});
html5QrcodeScanner.render(onScanSuccess);

// setup mock unity
const mockUnity = new MockUnity(document.getElementById("mockUnityContainer"));

// create main update loop
function mainLoop() {
    renderEventHistory();
    renderStatus();
}
setInterval(mainLoop, 1000 * 0.3);

// rendering
function renderStatus() {
    (async () => {
        try {
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
        } catch (e) {}
    })();
}
function renderEventHistory() {
    const elEventLogs = document.getElementById("events");
    elEventLogs.innerHTML = "";
    for (let index = 0; index < maxEventBacklog; index++) {
        const event = States.eventLogs[index];
        // filter the events
        const eventFilters = document
            .getElementById("eventFilter")
            .value.split(",");
        // check if colors should be highlighted
        const color = Object.keys(eventColors).includes(event.event)
            ? eventColors[event.event]
            : COLORS.defaultGrey;
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
            <div class="name-label" style="background-color:${color}">
                <div class="event-key">Event: </div>
                ${event.event}
            </div>
            <div class="payload-label" style="background-color:${color}">
                <div class="event-key">Payload: </div>
                ${payload}
            </div>
        </div> 
        `;
        }
    }
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
    Sockets.onClose = () => {
        connectoinLabel.innerHTML = "Not Connected";
        document.querySelector(
            ".root-client-connection"
        ).style = `background-color: ${COLORS.errorRed}`;
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
    States.eventLogs.unshift(dataParsed);
    MockUnity.instance.handleEvents(dataParsed);
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
        (async () => {
            triggerConfirmationAnimation("#proximityConfirmation");
            await fetch(`http://${url}/proximity?distance=${distance}`);
        })();
    }
}, 2 * 1000);
function onSendEventButtonClicked() {
    const eventName = document.getElementById("sendingEvent").value;
    const eventPayload = document.getElementById("sendingPayload").value;
    const payload = JSON.stringify({
        event: eventName,
        payload: eventPayload,
    });
    sockets.send(payload);
}
// event log filters
const filterPresets = {
    All: "playDialogue,lunaFinishedSpeaking,lunaResponded,updateLunaState,triggerVision,qrCodeScanned,showProduct,triggerTelegram,restart,updateTranscription,playRecordedAudio,timer,showNotificationAlert,showTooltip,updateLunaMode,updateCurrentSessionId,userReturnedFromPause,register,syncEnvironment",
    Conversation: "playDialogue,updateTranscription,playRecordedAudio",
    UI: "showTooltip,showPlayDialogue",
};
const allFilterButtons = document.querySelectorAll(".event-filters");
for (let index = 0; index < allFilterButtons.length; index++) {
    const element = allFilterButtons[index];
    element.addEventListener("click", () => {
        document.getElementById("eventFilter").value =
            filterPresets[element.innerHTML.trim()];
    });
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
    element.offsetWidth; // force re render
    element.classList.add("confirmation-animation");
}

// testing unity mock without server
window.addEventListener("keydown", (e) => {
    if (e.key === "t") {
        MockUnity.instance.handleEvents({
            event: "showTooltip",
            payload: {
                title: "Tooltip title ",
                body: "This is a body... lorem ipsum some random text yippiee",
            },
        });
    }
    if (e.key === "q") {
        MockUnity.instance.handleEvents({
            event: "qrCodeScanned",
            payload: "P023",
        });
    }
    if (e.key === "Q") {
        MockUnity.instance.handleEvents({
            event: "qrCodeScanned",
            payload: "lunapass",
        });
    }
    if (e.key === "n") {
        MockUnity.instance.handleEvents({
            event: "showNotificationAlert",
            payload: "This is a yellow alert",
        });
    }
    if (e.key === "m") {
        MockUnity.instance.handleEvents({
            event: "updateLunaMode",
            payload: "paused",
        });
    }
    if (e.key === "M") {
        MockUnity.instance.handleEvents({
            event: "updateLunaMode",
            payload: "onboarding",
        });
    }
    if (e.key === "c") {
        MockUnity.instance.handleEvents({
            event: "lunaResponded",
            payload: "Hi my name is Luna",
        });
    }
    if (e.key === "C") {
        MockUnity.instance.handleEvents({
            event: "lunaResponded",
            payload: "Can I take a picture of you",
        });
    }
    if (e.key === "1") {
        MockUnity.instance.handleEvents({
            event: "updateLunaState",
            payload: "idle",
        });
    }
    if (e.key === "2") {
        MockUnity.instance.handleEvents({
            event: "updateLunaState",
            payload: "thinking",
        });
    }
    if (e.key === "3") {
        MockUnity.instance.handleEvents({
            event: "updateLunaState",
            payload: "speaking",
        });
    }
    if (e.key === "v") {
        MockUnity.instance.handleEvents({
            event: "triggerVision",
            payload: "",
        });
    }
});

/*
events csv
playDialogue,lunaFinishedSpeaking,lunaResponded,updateLunaState,triggerVision,qrCodeScanned,showProduct,triggerTelegram,restart,updateTranscriptio,playRecordedAudio,timer,showNotificationAlert,showTooltip,updateLunaMode,updateCurrentSessionId,userReturnedFromPause,register,syncEnvironment
*/
