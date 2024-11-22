let sockets = null;

document.getElementById("connect").addEventListener("pointerup", () => {
    const urlInput = document.getElementById("urlInput");
    sockets = new Sockets(urlInput.value, "mockEngine");
    sockets.onMessageCallback = (data) => {
        const parsed = JSON.parse(data);
        loggedEvents.push(parsed);
        renderEvents();
    };
});

// on message from server
let eventsToListenTo = [
    "playDialogue",
    "lunaResponse",
    "lunaStateChanged",
    "visionTrigger",
    "qrCodeScanned",
    "productShow",
    "telegramTrigger",
    "restart",
    "updateTranscription",
];
const loggedEvents = [];
// render events on page
const elFeed = document.getElementById("feed");
const renderEvents = () => {
    let newHTML = "";
    for (let index = 0; index < loggedEvents.length; index++) {
        const message = loggedEvents[loggedEvents.length - 1 - index];
        if (eventsToListenTo.includes(message.event)) {
            newHTML += `
            <div class="event-entry">
                <strong>Event</strong>: ${message.event} - <strong> Payload: ${message.payload}</strong>
            </div>
        `;
        }
    }
    elFeed.innerHTML = newHTML;
};

const elSendButton = document.getElementById("sendButton");
elSendButton.addEventListener("pointerup", () => {
    // get fields
    const elEvent = document.getElementById("eventField");
    const elPayload = document.getElementById("payloadField");
    // send to socket
    sockets.send(
        JSON.stringify({ event: elEvent.value, payload: elPayload.value })
    );
    // clear fields
    elEvent.value = "";
    elPayload.payload = "";
});

document.getElementById("filterButton").addEventListener("pointerdown", () => {
    const input = document.querySelector("textarea").value;
    console.log(input);
    eventsToListenTo = input.split(",");
});
