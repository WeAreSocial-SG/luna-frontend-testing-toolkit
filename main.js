// create main update loop
function mainLoop() {
  // todo render events history
  renderEventHistory;
  // todo render states
  // todo render convertsation history
}
setInterval(mainLoop, 1000 * 0.3);

// rendering
function renderEventHistory() {
  const elEventLogs = document.getElementById("eventLogs");
  elEventLogs.innerHTML = "";
  States.eventLogs.forEach((event) => {
    console.log;
    elEventLogs.innerHTML += `
    <div>
        <strong>event</strong>:${
          event.event
        }, <strong>payload</strong>: ${event.payload.toString()}
    </div> 
    `;
  });
}

// event callbacks
let sockets = null;
function onConnectButtonClicked() {
  // start the websocket
  const url = document.getElementById("socketUrlInput").value;
  const sockets = new Sockets(url);
  // add maessage callback
  sockets.onMessageCallback = onEventReceived;
}
function onEventReceived(data) {
  const dataParsed = JSON.parse(data);
  States.eventLogs.push(dataParsed);
}
