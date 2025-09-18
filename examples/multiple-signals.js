import { signal, effect, tag } from "../src/xyn_html.js";

export const title = "Example 2: Multiple Signals and Effects";

export async function example2(output) {
    const firstName = signal("John");
    const lastName = signal("Doe");

    // Effect that runs when either signal changes
    const unsubscribe = effect(() => {
        output(`Full name: ${firstName.value} ${lastName.value}`);
    }, [firstName, lastName]);

    // Update signals to see effect in action
    output.append(tag`hr`);
    firstName.value = "Jane";
    output.append(tag`hr`);
    lastName.value = "Smith";

    // Clean up
    unsubscribe();
}
