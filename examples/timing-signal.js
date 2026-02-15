import { createSignal, watch, timing } from "../src/xyn_signal.js";
import { tag, text } from "../src/xyn_html.js";

export const title = "Example 23: Timing Functions";

function addOutput(container, message) {
    const p = document.createElement("p");
    p.textContent = message;
    container.appendChild(p);
}

function addCode(container, code) {
    const pre = document.createElement("pre");
    pre.style.cssText = "background: var(--code-bg, #f4f4f4); padding: 12px; border-radius: 6px; font-size: 13px; overflow-x: auto; margin: 8px 0;";
    const codeEl = document.createElement("code");
    codeEl.textContent = code;
    pre.appendChild(codeEl);
    container.appendChild(pre);
}

export async function example23(output) {
    const sections = [
        {
            title: "Debounce Effect",
            run: async (container, scrollTarget) => {
                addOutput(container, "Debounce waits for a pause in activity before executing.");
                addOutput(container, "Only the last call after the delay period passes is processed.");
                addCode(container,
`const debouncedFn = timing(300).debounce(() => {
    console.log(firstName.value, lastName.value);
});

watch(firstName).watch(lastName).effect(debouncedFn);`
                );
                addOutput(container, "");

                const firstName = createSignal("John");
                const lastName = createSignal("Doe");

                const debouncedEffect = timing(300).debounce(() => {
                    addOutput(container, `  Result: "${firstName.value} ${lastName.value}"`);
                    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
                });

                watch(firstName).watch(lastName).effect(debouncedEffect);

                addOutput(container, "Rapidly setting firstName: J → Ja → Jan → Jane");
                firstName.value = "J";
                firstName.value = "Ja";
                firstName.value = "Jan";
                firstName.value = "Jane";
                addOutput(container, "Rapidly setting lastName: S → Sm → Smi → Smith");
                lastName.value = "S";
                lastName.value = "Sm";
                lastName.value = "Smi";
                lastName.value = "Smith";

                await new Promise(r => setTimeout(r, 400));
                addOutput(container, "(Only one output after typing stopped)");
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        },
        {
            title: "Throttle Effect",
            run: async (container, scrollTarget) => {
                addOutput(container, "Throttle executes immediately, then limits to once per time window.");
                addCode(container,
`const throttledFn = timing(200).throttle(() => {
    console.log(firstName.value, lastName.value);
});

watch(firstName).watch(lastName).effect(throttledFn);`
                );
                addOutput(container, "");

                const firstName = createSignal("John");
                const lastName = createSignal("Doe");

                const throttledEffect = timing(200).throttle(() => {
                    addOutput(container, `  Result: "${firstName.value} ${lastName.value}"`);
                    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
                });

                watch(firstName).watch(lastName).effect(throttledEffect);

                addOutput(container, "Rapidly setting firstName: J → Ja → Jan → Jane");
                firstName.value = "J";
                firstName.value = "Ja";
                firstName.value = "Jan";
                firstName.value = "Jane";

                await new Promise(r => setTimeout(r, 250));

                addOutput(container, "After 200ms, setting lastName: S → Sm → Smith");
                lastName.value = "S";
                lastName.value = "Sm";
                lastName.value = "Smith";

                await new Promise(r => setTimeout(r, 250));
                addOutput(container, "(First change fires immediately, then one per 200ms window)");
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        },
        {
            title: "Delay Effect",
            run: async (container, scrollTarget) => {
                addOutput(container, "Delay executes every change, but after a fixed time.");
                addCode(container,
`const delayedFn = timing(200).delay(() => {
    console.log(firstName.value, lastName.value);
});

watch(firstName).watch(lastName).effect(delayedFn);`
                );
                addOutput(container, "");

                const firstName = createSignal("John");
                const lastName = createSignal("Doe");

                const delayedEffect = timing(200).delay(() => {
                    addOutput(container, `  Result: "${firstName.value} ${lastName.value}"`);
                    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
                });

                watch(firstName).watch(lastName).effect(delayedEffect);

                addOutput(container, "Setting firstName to 'Alice'...");
                firstName.value = "Alice";
                addOutput(container, "Setting lastName to 'Wonder'...");
                lastName.value = "Wonder";
                addOutput(container, "(Outputs appear after 200ms delay)");
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });

                await new Promise(r => setTimeout(r, 300));
            }
        },
        {
            title: "Debounce Derived",
            run: async (container, scrollTarget) => {
                addOutput(container, "Derived signal updates only after a pause in activity.");
                addCode(container,
`const { signal: debouncedName } = watch(firstName)
    .watch(lastName)
    .derived(
        () => \`\${firstName.value} \${lastName.value}\`,
        timing(300).debounce
    );`
                );
                addOutput(container, "");

                const firstName = createSignal("John");
                const lastName = createSignal("Doe");

                const { signal: debouncedName } = watch(firstName)
                    .watch(lastName)
                    .derived(
                        () => `${firstName.value} ${lastName.value}`,
                        timing(300).debounce
                    );

                addOutput(container, `Initial derived value: "${debouncedName.value}"`);

                firstName.value = "J";
                firstName.value = "Ja";
                firstName.value = "Jane";
                lastName.value = "Smith";

                addOutput(container, `Immediately after rapid changes: "${debouncedName.value}" (not updated yet)`);
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });

                await new Promise(r => setTimeout(r, 400));
                addOutput(container, `After 300ms pause: "${debouncedName.value}"`);
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        },
        {
            title: "Throttle Derived",
            run: async (container, scrollTarget) => {
                addOutput(container, "Derived signal updates at most once per time window.");
                addCode(container,
`const { signal: throttledName } = watch(firstName)
    .watch(lastName)
    .derived(
        () => \`\${firstName.value} \${lastName.value}\`,
        timing(200).throttle
    );`
                );
                addOutput(container, "");

                const firstName = createSignal("John");
                const lastName = createSignal("Doe");

                const { signal: throttledName } = watch(firstName)
                    .watch(lastName)
                    .derived(
                        () => `${firstName.value} ${lastName.value}`,
                        timing(200).throttle
                    );

                addOutput(container, `Initial derived value: "${throttledName.value}"`);

                firstName.value = "A";
                addOutput(container, `After first change: "${throttledName.value}" (immediate)`);

                firstName.value = "Al";
                firstName.value = "Ali";
                firstName.value = "Alic";
                firstName.value = "Alice";
                addOutput(container, `After rapid changes: "${throttledName.value}" (throttled)`);
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });

                await new Promise(r => setTimeout(r, 250));
                lastName.value = "Wonder";
                addOutput(container, `After 200ms + change: "${throttledName.value}"`);
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        },
        {
            title: "Delay Derived",
            run: async (container, scrollTarget) => {
                addOutput(container, "Derived signal updates after a fixed delay for each change.");
                addCode(container,
`const { signal: delayedName } = watch(firstName)
    .watch(lastName)
    .derived(
        () => \`\${firstName.value} \${lastName.value}\`,
        timing(200).delay
    );`
                );
                addOutput(container, "");

                const firstName = createSignal("John");
                const lastName = createSignal("Doe");

                const { signal: delayedName } = watch(firstName)
                    .watch(lastName)
                    .derived(
                        () => `${firstName.value} ${lastName.value}`,
                        timing(200).delay
                    );

                addOutput(container, `Initial derived value: "${delayedName.value}"`);

                firstName.value = "Bob";
                addOutput(container, `Immediately after change: "${delayedName.value}" (not yet)`);
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });

                await new Promise(r => setTimeout(r, 250));
                addOutput(container, `After 200ms delay: "${delayedName.value}"`);
                scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        }
    ];

    let currentSection = 0;
    let isRunning = false;
    let resetButtonEl = null;

    function createPlayButton(label, onClick) {
        const container = tag`div`;
        container.css.styles({ marginBottom: "24px" });

        const button = tag`button`;
        button.children.add(text(label));
        button.css.styles({
            padding: "10px 20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px"
        });
        button.event("click", onClick);
        container.children.add(button);

        return container;
    }

    function createResetButton() {
        const container = tag`div`;
        container.css.styles({ marginTop: "24px" });

        const button = tag`button`;
        button.children.add(text("Reset"));
        button.css.styles({
            padding: "10px 20px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px"
        });
        button.event("click", () => {
            if (isRunning) return;
            output.clear();
            currentSection = 0;
            resetButtonEl = null;
            showNextPlayButton();
        });
        container.children.add(button);

        return container;
    }

    function showSummary(container, scrollTarget) {
        addOutput(container, "");
        addOutput(container, "=== Summary ===");
        addOutput(container, "Effect: timing wraps the callback directly");
        addCode(container, "watch(a).watch(b).effect(timing(ms).debounce(fn))");
        addOutput(container, "Derived: timing method passed as wrappingFn argument");
        addCode(container, "watch(a).watch(b).derived(fn, timing(ms).debounce)");
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    function showNextPlayButton() {
        if (currentSection >= sections.length) {
            const summaryContainer = document.createElement("div");
            summaryContainer.style.marginBottom = "24px";

            const resetButton = createResetButton();
            output.append(resetButton);
            resetButtonEl = resetButton.render();

            resetButtonEl.parentNode.insertBefore(summaryContainer, resetButtonEl);
            showSummary(summaryContainer, resetButtonEl);
            return;
        }

        const section = sections[currentSection];
        const playButtonContainer = createPlayButton(`Play: ${section.title}`, async () => {
            if (isRunning) return;
            isRunning = true;

            const playEl = playButtonContainer.render();
            playEl.style.display = "none";

            const contentContainer = document.createElement("div");
            contentContainer.style.marginBottom = "24px";

            const titleEl = document.createElement("p");
            titleEl.textContent = `=== ${section.title} ===`;
            contentContainer.appendChild(titleEl);

            if (!resetButtonEl) {
                const resetButton = createResetButton();
                output.append(resetButton);
                resetButtonEl = resetButton.render();
            }

            resetButtonEl.parentNode.insertBefore(contentContainer, resetButtonEl);

            await section.run(contentContainer, resetButtonEl);

            currentSection++;
            isRunning = false;

            if (currentSection < sections.length) {
                const nextSection = sections[currentSection];
                const nextPlayButton = createPlayButton(`Play: ${nextSection.title}`, () => {
                    runNextSection(nextPlayButton, nextSection);
                });

                resetButtonEl.parentNode.insertBefore(nextPlayButton.render(), resetButtonEl);
            } else {
                const summaryContainer = document.createElement("div");
                summaryContainer.style.marginBottom = "24px";
                resetButtonEl.parentNode.insertBefore(summaryContainer, resetButtonEl);
                showSummary(summaryContainer, resetButtonEl);
            }
        });

        output.append(playButtonContainer);
    }

    async function runNextSection(playButtonContainer, section) {
        if (isRunning) return;
        isRunning = true;

        const playEl = playButtonContainer.render();
        playEl.style.display = "none";

        const contentContainer = document.createElement("div");
        contentContainer.style.marginBottom = "24px";

        const titleEl = document.createElement("p");
        titleEl.textContent = `=== ${section.title} ===`;
        contentContainer.appendChild(titleEl);

        resetButtonEl.parentNode.insertBefore(contentContainer, resetButtonEl);

        await section.run(contentContainer, resetButtonEl);

        currentSection++;
        isRunning = false;

        if (currentSection < sections.length) {
            const nextSection = sections[currentSection];
            const nextPlayButton = createPlayButton(`Play: ${nextSection.title}`, () => {
                runNextSection(nextPlayButton, nextSection);
            });

            resetButtonEl.parentNode.insertBefore(nextPlayButton.render(), resetButtonEl);
        } else {
            const summaryContainer = document.createElement("div");
            summaryContainer.style.marginBottom = "24px";
            resetButtonEl.parentNode.insertBefore(summaryContainer, resetButtonEl);
            showSummary(summaryContainer, resetButtonEl);
        }
    }

    showNextPlayButton();
}
