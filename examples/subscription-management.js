
import { signal } from "../src/xyn_html.js";

export async function example6() {
    const output = function(message) {
        const container = document.getElementById('example6-output');
        if (container) {
            const p = document.createElement('p');
            p.textContent = message;
            container.appendChild(p);
        }
    };

    const tempSignal = signal(0);
    let cleanupCount = 0;

    const tempSubscriber = () => {
        cleanupCount++;
        output(`Temp signal updated ${cleanupCount} times`);
    };
    tempSignal.subscribe(tempSubscriber);

    tempSignal.value = 1;
    tempSignal.value = 2;

    // Unsubscribing
    tempSignal.unsubscribe(tempSubscriber);
    output("Unsubscribed from temp signal");

    // This update won't trigger the subscriber
    tempSignal.value = 3;
    output("Updated signal after unsubscribe - no notification sent");
}
