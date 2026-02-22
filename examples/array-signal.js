import { createSignal } from "../src/xyn_signal.js";

export const title = "Example 20: Array Signal Reactivity";

export async function example20(output) {
    output("Creating array signal with createSignal(['apple', 'banana'])");
    const fruits = createSignal(["apple", "banana"]);

    output(`Initial state → [${fruits.join(", ")}]`);

    output("");
    output("Subscribing to changes:");
    let changeCount = 0;
    fruits.subscribe(() => {
        changeCount++;
        output(`  Subscriber #${changeCount} → [${fruits.join(", ")}]`);
    });

    output("");
    output("Pushing 'cherry': fruits.push('cherry')");
    fruits.push("cherry");

    output("");
    output("Unshifting 'apricot': fruits.unshift('apricot')");
    fruits.unshift("apricot");

    output("");
    output("Popping last item: fruits.pop()");
    fruits.pop();

    output("");
    output("Shifting first item: fruits.shift()");
    fruits.shift();

    output("");
    output("Splicing at index 1: fruits.splice(1, 1, 'blueberry')");
    fruits.splice(1, 1, "blueberry");

    output("");
    output("Final array state:");
    output(`  [${fruits.join(", ")}]`);
    output(`  Length: ${fruits.length}`);
    output(`  First item: ${fruits[0]}`);
    output(`  Last item: ${fruits.at(-1)}`);
}
