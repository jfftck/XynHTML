import { signal, effect, tag } from "../src/xyn_html.js";

export const title = "Example 2: Multiple Signals and Effects with Debouncing";

export async function example2(output) {
    const firstName = signal("John");
    const lastName = signal("Doe");

    output.signalUpdate("firstName", firstName);
    output.signalUpdate("lastName", lastName);

    // Effect that runs when either signal changes, but has a 1ms debounce delay.
    // This means it will only run after the signals have stopped changing for 1ms.
    // This is useful for preventing excessive re-renders in UI.
    // Note that this also puts the effect in a microtask queue, so it will run after
    // the current task queue is empty. So, it will run after the signals have stopped
    // changing for 1ms, but not necessarily immediately after.
    const unsubscribe = effect(() => {
        output(`Full name: ${firstName.value} ${lastName.value}`);
    }, [firstName, lastName], { delay: 1 });

    // Update signals to see effect in action; these are called quickly that both values
    // will be updated before the effect runs, on most systems.
    firstName.value = "Jane";
    lastName.value = "Smith";

    // Clean up
    unsubscribe();
}
