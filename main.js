// create main update loop
function mainLoop() {
  // todo render events history
  console.log(States.eventLogs);
  const elEventLogs = document.getElementById("eventLogs");
  elEventLogs.innerHTML = "";
  States.eventLogs.forEach((event) => {
    elEventLogs.innerHTML += `
    <div>
        <strong>event</strong>:${event.event}, <strong>payload</strong>: ${event.payload}
    </div> 
    `;
  });
  // todo render states
  // todo render convertsation history
}
setInterval(mainLoop, 1000 * 0.3);

// event callbacks
function onConnectButtonClicked() {
  // start the websocket
  const url = document.getElementById("socketUrlInput").value;
  const sockets = new Sockets(url);
  // add maessage callback
  sockets.onMessageCallback = (data) => {
    const dataParsed = JSON.parse(data);
    States.eventLogs.push(dataParsed);
  };
}
