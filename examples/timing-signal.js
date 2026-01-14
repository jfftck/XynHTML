import { createSignal, watch, timing } from "../src/xyn_signal.js";
import { tag, text } from "../src/xyn_html.js";

export const title = "Example 23: Timing Functions";

function addOutput(container, message) {
    const p = document.createElement("p");
    p.textContent = message;
    container.appendChild(p);
}

async function runDebounceEffect(container, scrollTarget) {
    addOutput(container, "Debounce waits for pause in activity before executing.");
    addOutput(container, "(Only the last value after 300ms pause is processed)");
    addOutput(container, "");
    
    const firstName = createSignal("John");
    const lastName = createSignal("Doe");
    
    const debouncedEffect = timing(300).debounce(() => {
        addOutput(container, `Debounced: Full name is "${firstName.value} ${lastName.value}"`);
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    
    watch(firstName).watch(lastName).effect(debouncedEffect);
    
    firstName.value = "J";
    firstName.value = "Ja";
    firstName.value = "Jan";
    firstName.value = "Jane";
    lastName.value = "S";
    lastName.value = "Sm";
    lastName.value = "Smi";
    lastName.value = "Smith";
    
    await new Promise(r => setTimeout(r, 400));
    addOutput(container, "(Only one output after typing stopped)");
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
}

async function runThrottleEffect(container, scrollTarget) {
    addOutput(container, "Throttle limits execution to once per time window.");
    addOutput(container, "(First change executes immediately, then at most once per 200ms)");
    addOutput(container, "");
    
    const firstName = createSignal("John");
    const lastName = createSignal("Doe");
    
    const throttledEffect = timing(200).throttle(() => {
        addOutput(container, `Throttled: Full name is "${firstName.value} ${lastName.value}"`);
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    
    watch(firstName).watch(lastName).effect(throttledEffect);
    
    firstName.value = "J";
    firstName.value = "Ja";
    firstName.value = "Jan";
    firstName.value = "Jane";
    
    await new Promise(r => setTimeout(r, 250));
    
    lastName.value = "S";
    lastName.value = "Sm";
    lastName.value = "Smith";
    
    await new Promise(r => setTimeout(r, 250));
    addOutput(container, "(Limited outputs - first change + one per 200ms window)");
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
}

async function runDelayEffect(container, scrollTarget) {
    addOutput(container, "Delay executes each change after a fixed time.");
    addOutput(container, "(Every change triggers, but after 200ms delay)");
    addOutput(container, "");
    
    const firstName = createSignal("John");
    const lastName = createSignal("Doe");
    
    const delayedEffect = timing(200).delay(() => {
        addOutput(container, `Delayed: Full name is "${firstName.value} ${lastName.value}"`);
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

async function runDebounceDerived(container, scrollTarget) {
    addOutput(container, "Derived signal updates only after typing pause.");
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
    
    addOutput(container, `Immediately after changes: "${debouncedName.value}" (not updated yet)`);
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
    
    await new Promise(r => setTimeout(r, 400));
    addOutput(container, `After 300ms pause: "${debouncedName.value}"`);
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
}

async function runThrottleDerived(container, scrollTarget) {
    addOutput(container, "Derived signal updates at most once per time window.");
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

async function runDelayDerived(container, scrollTarget) {
    addOutput(container, "Derived signal updates after fixed delay for each change.");
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

function showSummary(container, scrollTarget) {
    addOutput(container, "");
    addOutput(container, "=== Summary ===");
    addOutput(container, "Effect: timing wraps the callback directly");
    addOutput(container, "  watch(a).watch(b).effect(timing(ms).debounce(fn))");
    addOutput(container, "");
    addOutput(container, "Derived: timing passed as wrappingFn argument");
    addOutput(container, "  watch(a).watch(b).derived(fn, timing(ms).debounce)");
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
}

export async function example23(output) {
    const sections = [
        { title: "Debounce Effect", run: runDebounceEffect },
        { title: "Throttle Effect", run: runThrottleEffect },
        { title: "Delay Effect", run: runDelayEffect },
        { title: "Debounce Derived", run: runDebounceDerived },
        { title: "Throttle Derived", run: runThrottleDerived },
        { title: "Delay Derived", run: runDelayDerived }
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
                const nextPlayButton = createPlayButton(`Play: ${nextSection.title}`, handlePlayClick);
                
                function handlePlayClick() {
                    runNextSection(nextPlayButton, nextSection);
                }
                
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
