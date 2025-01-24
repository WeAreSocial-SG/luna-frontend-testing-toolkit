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
        };
        // socket.
    }
}
