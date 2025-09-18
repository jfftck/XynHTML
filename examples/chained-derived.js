import { effect, signal, derived, tag } from "../src/xyn_html.js";

export const title = "Example 7: Chained Derived Values";

export async function example7(output) {
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
    }, [textInput]); // Note that we only need to watch for changes on textInput.

    // Subscribe to see analysis changes
    const unsubscribe = effect(() => {
        output(`Analysis: ${JSON.stringify(analysis.value, null, 2)}`);
    }, [analysis]);

    // Update text to see chained derived values
    output.append(tag`hr`);
    textInput.value = "XynHTML is awesome";
    output.append(tag`hr`);
    textInput.value = "Building reactive applications made simple";

    // Clean up
    unsubscribe();
    analysis.unsubscribeDerived();
    wordCount.unsubscribeDerived();
    uppercase.unsubscribeDerived();
}