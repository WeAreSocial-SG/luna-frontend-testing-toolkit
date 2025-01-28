const htmlElements = `
    <!-- background image -->
    <div class="overlay">
        <img src="assets/luna.png" class="luna-image"/>        
    </div>

    <!-- session id -->
    <div class="overlay">
        <div class="unity-session-id" >
            In session: <strong>#<span id="sessionLabel">0000</span></strong>
        </div>
    </div>

    <!-- tooltip -->
    <div class="overlay">
        <div class="unity-tooltip">
            <div class="unity-tooltip-container" id="tooltipContainer">
                <h1 id="tooltipTitle">Title</h1>
                <hr/>
                <p id="tooltipBody">hello</p>
            </div>
        </div>
    </div>

    <!-- scanner confirmation -->
    <div class="overlay">
        <div class="unity-scanner-confirmation" id="scannerConfirmationContainer">
            <div class="unity-scanner-confirmation-container" >
                <p id="scannerConfirmationLabel">QR Code Scanned</p>
            </div>
        </div>
    </div>

    <!-- notification alert -->
    <div class="overlay">
        <div class="unity-notification-alert-container" >
            <div class="unity-notification-alert" id="notificationContainer" >
                <p id="notificationLabel">Sup dude</p>
            </div>
        </div>
    </div>

    <!-- conversation bubbles -->
    <div class="overlay">
        <div class="bubble-container">
            <div class="bubble" id="bubble2" style="opacity: 0">word 1</div> 
            <div class="bubble" id="bubble1">word 2</div> 
        </div>
    </div>

    <!-- vision trigger -->
    <div class="overlay unity-vision-overlay">
        <div class="vision-card">
            <div class="vision-square">
                <video autoplay id="visionVideo"/>
            </div>
            <div id="visionTimerOverlay" class="overlay">3</div>
        </div>
    </div>

    <!-- paused overlay -->
    <div class="overlay unity-paused-overlay">
        <div class="unity-paused-card">
            <h1>Session's paused</h1>
            <hr/>
            <p>Inactive User:</p>
            <div class="user-label">USER#1204</div>
            <p>Step into the detection area to resume or start a new session</p>
            <h2 id="pausedTimerLabel">30s</h2>
            <p>Until session restarts</p>
        </div>
    </div>

`;

class MockUnity {
    static instance = null;
    // states
    states = {
        conversationHistory: ["", ""],
        pausedTimer: 0,
        visionTimer: 0,
    };
    constructor(parentElement, socket) {
        // handle singleton
        if (MockUnity.instance) {
            return MockUnity.instance;
        }
        MockUnity.instance = this;
        // setup this variables
        this.parentElement = parentElement;
        // initialise all the html
        parentElement.innerHTML = htmlElements;
        // get references to new elements
        this.elements = {
            sessionLabel: document.getElementById("sessionLabel"),
            tooltipContainer: document.getElementById("tooltipContainer"),
            tooltipTitle: document.getElementById("tooltipTitle"),
            tooltipBody: document.getElementById("tooltipBody"),
            scannerConfirmationContainer: document.getElementById(
                "scannerConfirmationContainer"
            ),
            scannerConfirmationLabel: document.getElementById(
                "scannerConfirmationLabel"
            ),
            notifcationLabel: document.getElementById("notificationLabel"),
            notificationContainer: document.getElementById(
                "notificationContainer"
            ),
            pausedOvelay: document.querySelector(".unity-paused-overlay"),
            pausedTimerLabel: document.getElementById("pausedTimerLabel"),
            bubble1: document.getElementById("bubble1"),
            bubble2: document.getElementById("bubble2"),
            visionOverlay: document.querySelector(".unity-vision-overlay"),
            visionTimerLabel: document.querySelector("#visionTimerOverlay"),
        };
        // setup the camera
        (async () => {
            console.log("camera");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            const videoElement = document.getElementById("visionVideo");
            videoElement.srcObject = stream;
        })();
        // timer ticker
        setInterval(this.timerTick.bind(this), 1000);
    }
    handleEvents(event) {
        console.log("mock unity received event:", event);
        switch (event.event) {
            case "updateCurrentSessionId":
                this.elements.sessionLabel.innerHTML = event.payload;
                break;
            case "showTooltip":
                // update elements
                this.elements.tooltipTitle.innerHTML = event.payload.title;
                this.elements.tooltipBody.innerHTML = event.payload.body;
                // play animation
                this.elements.tooltipContainer.classList.remove(
                    "play-slide-right-animation"
                );
                this.elements.tooltipContainer.clientHeight;
                this.elements.tooltipContainer.classList.add(
                    "play-slide-right-animation"
                );
                break;
            case "qrCodeScanned":
                // update elemets
                if (Array.from(event.payload.toLowerCase())[0] === "p") {
                    this.elements.scannerConfirmationLabel.innerHTML =
                        "Product Scanned";
                } else {
                    this.elements.scannerConfirmationLabel.innerHTML =
                        "Luna Pass Scanned";
                }
                // play anim
                this.elements.scannerConfirmationContainer.classList.remove(
                    "play-slide-right-animation"
                );
                this.elements.scannerConfirmationContainer.clientHeight;
                this.elements.scannerConfirmationContainer.classList.add(
                    "play-slide-right-animation"
                );
                break;
            case "showNotificationAlert":
                // update elements
                this.elements.notifcationLabel.innerHTML = event.payload;
                // play animation
                this.elements.notificationContainer.classList.remove(
                    "play-slide-down-animation"
                );
                this.elements.notificationContainer.clientHeight;
                this.elements.notificationContainer.classList.add(
                    "play-slide-down-animation"
                );
                break;
            case "updateLunaMode":
                if (event.payload === "paused") {
                    this.elements.pausedOvelay.style = "opacity:1";
                    // update user card
                    document.querySelector(
                        ".unity-paused-card .user-label"
                    ).innerHTML = "#" + this.elements.sessionLabel.innerHTML;
                    // u[date timer]
                    this.states.pausedTimer = 30;
                } else {
                    this.elements.pausedOvelay.style = "opacity:0";
                }
                break;
            case "lunaResponded":
                // update variable
                if (this.states.conversationHistory[0] === "") {
                    // empty array
                    this.states.conversationHistory[0] = event.payload;
                } else {
                    // push back element zero and insert new event
                    this.states.conversationHistory[1] =
                        this.states.conversationHistory[0];
                    this.states.conversationHistory[0] = event.payload;
                }
                // render elements
                if (this.states.conversationHistory[0] !== "") {
                    this.elements.bubble1.innerHTML =
                        this.states.conversationHistory[0];
                }
                if (this.states.conversationHistory[1] !== "") {
                    this.elements.bubble2.innerHTML =
                        this.states.conversationHistory[1];
                    this.elements.bubble2.style = "";
                } else {
                    this.elements.bubble2.style = "opacity: 0";
                }
                break;
            case "updateLunaState":
                if (event.payload === "thinking") {
                    this.elements.bubble1.innerHTML = "• • •";
                } else {
                    this.elements.bubble1.innerHTML =
                        this.states.conversationHistory[0];
                }
                break;
            case "triggerVision":
                // update timer
                this.states.visionTimer = "3";
                // bring up the vision timer
                this.elements.visionOverlay.style = "opacity: 1"; // if vision timer is down
                // update timer
                this.elements.visionTimerLabel.innerHTML =
                    this.states.visionTimer + 1;
                break;
            default:
                console.log(
                    `unknown event received: ${event.event} with payload: ${event.payload}`
                );
                break;
        }
    }
    timerTick() {
        // iterate over all timers in state
        this.states.pausedTimer -= 1;
        this.states.visionTimer -= 1;
        // clamp the values
        if (this.states.pausedTimer < 0) {
            this.states.pausedTimer = 0;
        }
        if (this.states.visionTimer < 0) {
            this.elements.visionOverlay.style = "opacity: 0"; // if vision timer is down
            this.states.visionTimer = 0;
        }
        // update the timer ui
        this.elements.pausedTimerLabel.innerHTML =
            this.states.pausedTimer + "s";
        this.elements.visionTimerLabel.innerHTML = this.states.visionTimer + 1;
    }
}
