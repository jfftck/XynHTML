import { signal, derived } from "../src/xyn_html.js";
import { createOutput } from "./index.js";

export async function example7() {
    const output = createOutput('example7-output');

    const textInput = signal("hello world");

    const uppercase = derived(() => {
        return textInput.value.toUpperCase();
    }, [textInput]);

    const wordCount = derived(() => {
        return uppercase.value.split(' ').length;
    }, [uppercase]);

    const analysis = derived(() => {
        return {
            original: textInput.value,
            uppercase: uppercase.value,
            wordCount: wordCount.value,
            charCount: textInput.value.length
        };
    }, [textInput, uppercase, wordCount]);

    // Subscribe to see analysis changes
    const unsubscribeEffect = effect(() => {
        output(`Analysis: ${JSON.stringify(analysis.value, null, 2)}`);
        output("---");
    }, [analysis]);

    // Update text to see chained derived values
    textInput.value = "XynHTML is awesome";
    textInput.value = "Building reactive applications made simple";
}