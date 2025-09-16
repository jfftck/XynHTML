import { signal, tag } from "../src/xyn_html.js";

export const title = "Example 6: Subscription Management";

export async function example6(output) {
    const tempSignal = signal(0);
    let cleanupCount = 0;

    const tempSubscriber = () => {
        output(`Temp signal updated ${cleanupCount++} times`);
    };
    tempSignal.subscribe(tempSubscriber);

    // Updating the signal
    output.append(tag`hr`.render());
    tempSignal.value = 1;
    output.append(tag`hr`.render());
    tempSignal.value = 2;

    // Unsubscribing
    tempSignal.unsubscribe(tempSubscriber);
    output("Unsubscribed from temp signal");

    // This update won't trigger the subscriber
    output.append(tag`hr`.render());
    tempSignal.value = 3;
    output("Updated signal after unsubscribe - no notification sent");
}
