
import { signal, effect } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example2() {
    const output = createOutput('example2-output');

    const firstName = signal("John");
    const lastName = signal("Doe");

    // Effect that runs when either signal changes
    const unsubscribeEffect = effect(() => {
        output(`Full name: ${firstName.value} ${lastName.value}`);
    }, [firstName, lastName]);

    firstName.value = "Jane";
    lastName.value = "Smith";
}
