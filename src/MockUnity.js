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

    <!-- notification alert -->
    <div class="overlay unity-paused-overlay">
        <div class="unity-paused-card">
            <h1>Session's paused</h1>
            <hr/>
            <p>Inactive User:</p>
            <div class="user-label">USER#1204</div>
            <p>Step into the detection area to resume or start a new session</p>
            <h2 id="pausedTimerTael">30s</h2>
            <p>Until session restarts</p>
        </div>
    </div>

    <!-- conversation bubbles -->
    <div class="overlay">
        <div class="bubble-container">
            <div class="bubble" id="bubble2">word 1</div> 
            <div class="bubble" id="bubble1">word 2</div> 
        </div>
    </div>
`;

class MockUnity {
    static instance = null;
    constructor(parentElement, socket) {
        // handle singleton
        if (MockUnity.instance) {
            return MockUnity.instance;
        }
        console.log("initialising mock unity");
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
        };
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
                } else {
                    this.elements.pausedOvelay.style = "opacity:0";
                }
                break;
            default:
                console.log(
                    `unknown event received: ${event.event} with payload: ${event.payload}`
                );
                break;
        }
    }
}
