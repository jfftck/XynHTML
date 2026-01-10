import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 20: Array Signal Reactivity";

export async function example20(output) {
    output("Creating array signal with createSignal(['apple', 'banana'])");
    const fruits = createSignal(["apple", "banana"]);

    fruits.subscribe((change) => {
        const valueStr = String(change.value);
        const prevStr = String(change.previousValue);
        output(`Array operation at index '${change.index}': ${prevStr} → ${valueStr}`);
    });

    output("");
    output("Pushing 'cherry': fruits.value.push('cherry')");
    fruits.value.push("cherry");

    output("");
    output("Unshifting 'apricot': fruits.value.unshift('apricot')");
    fruits.value.unshift("apricot");

    output("");
    output("Popping last item: fruits.value.pop()");
    fruits.value.pop();

    output("");
    output("Shifting first item: fruits.value.shift()");
    fruits.value.shift();

    output("");
    output("Splicing at index 1: fruits.value.splice(1, 1, 'blueberry')");
    fruits.value.splice(1, 1, "blueberry");

    output("");
    output("Final array state:");
    output(`  [${fruits.value.join(", ")}]`);
}
