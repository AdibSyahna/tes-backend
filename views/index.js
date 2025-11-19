// @ts-check
"strict";

class MainClass {
    #API_URL = "/api";
    #RefreshIntervalMS = 100;
    #Running = false;

    /**
     * @type {NodeJS.Timeout | null}
     */
    #SynchronizeInterval = null;

    /**
     * @type {{type: string, content: string}[]}
     */
    #Logs = [];

    constructor() {
        this.init();
    }

    async init() {
        this.#fetchStatusMessage();
        this.#fetchLogs();
    }

    async start() {
        if (this.#Running) return;

        const StartButton = /** @type {HTMLButtonElement | null} */(document.getElementById("start-btn"));
        if (!StartButton) return alert("Start button not found");

        this.#Running = true;
        this.#synchronize();

        // disable the StartButton
        StartButton.disabled = true;

        const Result = await this.#APIfetch("/start", null, "POST");

        this.#Running = false;
        this.#stopSynchronize();

        // re-enable the StartButton
        StartButton.disabled = false;
    }

    async #stopSynchronize() {
        if (!this.#SynchronizeInterval) return;
        this.#SynchronizeInterval.close();
        this.#SynchronizeInterval = null;
    }

    async #synchronize() {
        this.#SynchronizeInterval = setInterval(() => {
            this.#fetchStatusMessage();
            this.#fetchLogs();
        }, this.#RefreshIntervalMS);
    }

    async #fetchLogs() {
        const Logs = await this.#APIfetch("/log");
        this.#Logs = Logs;

        const LogBox = document.getElementById("log-box");
        if (!LogBox) return alert("Log box not found");

        let HTML = "";
        for (let i = 0; i < Logs.length; i++) {
            const Log = Logs[i];
            HTML += /*html*/`
                <p><code class="${Log.type}">${Log.content}</code></p>
                <hr>
            `;
        }

        LogBox.innerHTML = HTML;
    }

    async #fetchStatusMessage() {
        const Status = await this.#APIfetch("/status");
        const StatusMessage = document.getElementById("status");
        if (!StatusMessage) return alert("Status message element not found");
        StatusMessage.innerText = Status;
    }

    /**
     * Make a fetch call with API URL as base URL
     * @param {string} url 
     * @param {FormData | null} body 
     * @param {"GET" | "POST" | "PATCH" | "PUT" | "DELETE"} method
     */
    #APIfetch(url, body = null, method = "GET", raw = false) {
        return new Promise((resolve, reject) => {
            fetch(this.#API_URL + url, {
                method: method,
                body: body,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')) || ''
                }
            })
                .then(async (response) => {
                    if (response.status != 200) {
                        throw new Error('Error: ' + response.statusText);
                    }
                    resolve(!raw ? await response.json() : response);
                })
                .catch(error => {
                    console.error('Error:', error);
                    return reject(error);
                });
        });
    }
};

const Main = new MainClass();