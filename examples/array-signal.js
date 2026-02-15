import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 20: Array Signal Reactivity";

export async function example20(output) {
    output("Creating array signal with createSignal(['apple', 'banana'])");
    const fruits = createSignal(["apple", "banana"]);

    output(`Initial state → [${fruits.value.join(", ")}]`);

    output("");
    output("Pushing 'cherry': fruits.value.push('cherry')");
    fruits.value.push("cherry");
    output(`  → [${fruits.value.join(", ")}]`);

    output("");
    output("Unshifting 'apricot': fruits.value.unshift('apricot')");
    fruits.value.unshift("apricot");
    output(`  → [${fruits.value.join(", ")}]`);

    output("");
    output("Popping last item: fruits.value.pop()");
    fruits.value.pop();
    output(`  → [${fruits.value.join(", ")}]`);

    output("");
    output("Shifting first item: fruits.value.shift()");
    fruits.value.shift();
    output(`  → [${fruits.value.join(", ")}]`);

    output("");
    output("Splicing at index 1: fruits.value.splice(1, 1, 'blueberry')");
    fruits.value.splice(1, 1, "blueberry");
    output(`  → [${fruits.value.join(", ")}]`);

    output("");
    output("Final array state:");
    output(`  [${fruits.value.join(", ")}]`);
}
