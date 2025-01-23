class Sockets {
    lastConnectionTime = Date.now();
    onMessageCallback = (data) => {
        console.log("received socket message", data);
    };
    onOpen = () => {
        console.log("Web socket is successfully open");
    };
    onClose = () => {
        console.log("web socket is closed");
    };
    constructor(wssUrl, connectionName) {
        // initialise connection
        this.socketConnection = new WebSocket(wssUrl);
        this.disconnectionTime = 2.0;
        // register
        // handle events
        this.socketConnection.onopen = () => {
            //invoke on open call back
            Sockets.onOpen();
            // handle events
            this.socketConnection.onmessage = ({ data }) => {
                this.lastConnectionTime = Date.now();
                this.onMessageCallback(data);
            };
            // register connection
            this.send(
                JSON.stringify({
                    event: "register",
                    payload: connectionName,
                })
            );
            // log connections successfully established
            console.log("websockets connection sucessfully established");
            // constantly check for server connection
            //   setInterval(this.checkServer.bind(this), 1000);
        };
        this.socketConnection.onclose = () => {
            // invoke the callback
            Sockets.onClose();
        };
    }
    send(payload) {
        this.socketConnection.send(payload);
    }
    //   checkServer() {
    //     const duration = (Date.now() - this.lastConnectionTime) / 1000;
    //     if (duration > this.disconnectionTime) {
    //       // call for refresh
    //       location.reload();
    //     }
    //   }
}
