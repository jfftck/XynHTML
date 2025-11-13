import { signal, effect, tag, mountNext, text } from "../src/xyn_html.js";

function getExamples() {
    return document
        .querySelectorAll("[data-example]")
        .values()
        .map((container) => container.getAttribute("data-example"));
}

// Utility function to create output in specific containers
export function createOutput(containerId) {
    const container = document.getElementById(containerId);

    function message(message) {
        if (container) {
            const p = tag`p`;

            p.children.add(text(message));
            mountNext(p, container);
        }
    }

    message.clear = function () {
        if (container) {
            container.replaceChildren();
        }
    };

    message.append = function (element) {
        if (container) {
            mountNext(element, container);
        }
    };

    message.signalUpdate = function (signalName, signal) {
        effect(
            ({ previousValue }) => {
                if (previousValue === undefined) {
                    return;
                }
                const hr = tag`hr`;
                hr.attributes.set(
                    "data-signal",
                    `${signalName} updated: ${signal.value}`,
                );
                this.append(hr);
            },
            [signal],
        );
    };

    return message;
}

function addExampleTitle(containerId, title) {
    const container = document.getElementById(containerId);
    if (container) {
        const parent = container.parentElement;
        const h3 = document.createElement("h3");
        h3.textContent = title;
        // Extract example number from containerId (e.g., "example1-output" -> "example1-title")
        const exampleId = containerId.replace("-output", "-title");
        h3.id = exampleId;
        parent.insertBefore(h3, container);
    }
}

// Add source code to examples
function addSourceCode(containerId, func) {
    const container = document.getElementById(containerId);
    if (container) {
        const parent = container.parentElement;
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.className = "language-javascript";
        code.textContent = func.toString();
        pre.appendChild(code);
        parent.insertBefore(pre, container);
        // Only highlight if not already highlighted
        if (!code.classList.contains("hljs")) {
            hljs.highlightElement(code);
        }
    }
}

// Global theme management
function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

const savedTheme = localStorage.getItem("xynhtml-theme") || getSystemTheme();
const globalTheme = signal(savedTheme);

// Make globalTheme available to other modules
window.globalTheme = globalTheme;

// Highlight.js theme configurations
const highlightThemes = {
    light: [
        { name: "Default", value: "default" },
        { name: "GitHub", value: "github" },
        { name: "Atom One Light", value: "atom-one-light" },
        { name: "VS Code Light", value: "vs" },
        { name: "Lightfair", value: "lightfair" },
        { name: "Grayscale", value: "grayscale" },
        { name: "Brown Paper", value: "brown-paper" },
        { name: "School Book", value: "school-book" },
        { name: "Foundation", value: "foundation" },
        { name: "Googlecode", value: "googlecode" },
    ],
    dark: [
        { name: "Dark", value: "dark" },
        { name: "Monokai", value: "monokai" },
        { name: "Nord", value: "nord" },
        { name: "Atom One Dark", value: "atom-one-dark" },
        { name: "VS Code Dark", value: "vs2015" },
        { name: "Obsidian", value: "obsidian" },
        { name: "Tokyo Night Dark", value: "tokyo-night-dark" },
        { name: "Monokai Sublime", value: "monokai-sublime" },
        { name: "Arta", value: "arta" },
        { name: "Codepen Embed", value: "codepen-embed" },
    ],
};

// Syntax highlighting theme management
const savedSyntaxTheme = localStorage.getItem("xynhtml-syntax-theme");
const syntaxTheme = signal(
    savedSyntaxTheme || (getSystemTheme() === "dark" ? "monokai" : "github"),
);

// Track if this is the initial load to prevent fade effects
const isInitialLoad = signal(true);

function applySyntaxTheme(themeName, skipTransition = false) {
    const themeLink = document.getElementById("highlight-theme");
    if (!themeLink) return;

    const codeBlocks = document.querySelectorAll("pre code");
    if (codeBlocks.length === 0) return;

    // Set up the new theme URL
    const newThemeUrl = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeName}.min.css`;

    // Function to re-highlight and fade back in
    const reHighlightAndFadeIn = () => {
        codeBlocks.forEach((block) => {
            // Store the original text content before clearing
            const originalText = block.textContent;

            // Clear existing highlighting by resetting content
            block.textContent = originalText;
            block.className = "language-javascript";
            block.removeAttribute("data-highlighted");
            delete block.dataset.highlighted;

            // Re-highlight the clean content
            hljs.highlightElement(block);
        });

        // Only fade back in if not skipping transitions
        if (!skipTransition) {
            setTimeout(() => {
                codeBlocks.forEach((block) => {
                    block.style.opacity = "1";
                });
            }, 50);
        }
    };

    // Count how many blocks have completed their fade out animation
    let fadeOutCount = 0;
    const totalBlocks = codeBlocks.length;

    // Function to handle when all fade outs are complete
    const onAllFadeOutsComplete = () => {
        // Apply new theme
        themeLink.href = newThemeUrl;

        // Wait for the CSS to load before re-highlighting
        themeLink.onload = () => {
            setTimeout(reHighlightAndFadeIn, 50);
        };

        // Error handling for failed theme loads
        themeLink.onerror = () => {
            console.warn(`Failed to load theme: ${themeName}, using default`);
            themeLink.href =
                "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css";
            setTimeout(reHighlightAndFadeIn, 50);
        };

        // Fallback for browsers that don't support onload for link elements
        setTimeout(() => {
            if (fadeOutCount === totalBlocks) {
                reHighlightAndFadeIn();
            }
        }, 200);
    };

    // Skip transitions if this is initial load or explicitly requested
    if (skipTransition) {
        onAllFadeOutsComplete();
        return;
    }

    // Fade out all code blocks and wait for animation to complete
    codeBlocks.forEach((block) => {
        block.style.transition = "opacity 0.2s ease-in-out";

        const handleTransitionEnd = (event) => {
            if (event.propertyName === "opacity" && event.target === block) {
                fadeOutCount++;
                block.removeEventListener("transitionend", handleTransitionEnd);

                // If all blocks have faded out, apply the theme change
                if (fadeOutCount === totalBlocks) {
                    onAllFadeOutsComplete();
                }
            }
        };

        block.addEventListener("transitionend", handleTransitionEnd);
        block.style.opacity = "0";
    });

    // Fallback timeout in case transition events don't fire
    setTimeout(() => {
        if (fadeOutCount < totalBlocks) {
            console.warn("Fade animation timeout, applying theme change");
            onAllFadeOutsComplete();
        }
    }, 500);
}

// Apply global theme
const applyGlobalTheme = (theme) => {
    // Remove existing theme classes
    document.body.classList.remove("theme-light", "theme-dark");

    // Add new theme class
    document.body.classList.add(`theme-${theme}`);

    // Set data attribute for CSS targeting (keep for compatibility)
    document.body.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
};

// Create global theme switcher at top of page
const globalThemeSwitcher = document.createElement("div");
globalThemeSwitcher.className = "theme-switcher";

const globalThemeButton = document.createElement("button");
globalThemeButton.type = "button";
globalThemeButton.ariaLabel = "Toggle theme";
globalThemeButton.title = "Toggle theme";
globalThemeButton.className = "theme-toggle";
globalThemeButton.innerHTML = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="theme-toggle__within"
    height="1em"
    width="1em"
    viewBox="0 0 32 32"
    fill="currentColor"
  >
    <clipPath id="theme-toggle__within__clip">
      <path d="M0 0h32v32h-32ZM6 16A1 1 0 0026 16 1 1 0 006 16" />
    </clipPath>
    <g clip-path="url(#theme-toggle__within__clip)">
      <path d="M30.7 21.3 27.1 16l3.7-5.3c.4-.5.1-1.3-.6-1.4l-6.3-1.1-1.1-6.3c-.1-.6-.8-.9-1.4-.6L16 5l-5.4-3.7c-.5-.4-1.3-.1-1.4.6l-1 6.3-6.4 1.1c-.6.1-.9.9-.6 1.3L4.9 16l-3.7 5.3c-.4.5-.1 1.3.6 1.4l6.3 1.1 1.1 6.3c.1.6.8.9 1.4.6l5.3-3.7 5.3 3.7c.5.4 1.3.1 1.4-.6l1.1-6.3 6.3-1.1c.8-.1 1.1-.8.7-1.4zM16 25.1c-5.1 0-9.1-4.1-9.1-9.1 0-5.1 4.1-9.1 9.1-9.1s9.1 4.1 9.1 9.1c0 5.1-4 9.1-9.1 9.1z" />
    </g>
    <path
      class="theme-toggle__within__circle"
      d="M16 7.7c-4.6 0-8.2 3.7-8.2 8.2s3.6 8.4 8.2 8.4 8.2-3.7 8.2-8.2-3.6-8.4-8.2-8.4zm0 14.4c-3.4 0-6.1-2.9-6.1-6.2s2.7-6.1 6.1-6.1c3.4 0 6.1 2.9 6.1 6.2s-2.7 6.1-6.1 6.1z"
    />
    <path
      class="theme-toggle__within__inner"
      d="M16 9.5c-3.6 0-6.4 2.9-6.4 6.4s2.8 6.5 6.4 6.5 6.4-2.9 6.4-6.4-2.8-6.5-6.4-6.5z"
    />
  </svg>
`;

globalThemeButton.onclick = () => {
    globalTheme.value = globalTheme.value === "light" ? "dark" : "light";
};

// Create syntax highlighting theme selector with custom dropdown
const syntaxThemeContainer = document.createElement("div");
syntaxThemeContainer.className = "syntax-theme-container";

const syntaxThemeButton = document.createElement("button");
syntaxThemeButton.type = "button";
syntaxThemeButton.className = "syntax-theme-button";
syntaxThemeButton.title = "Select code theme";
syntaxThemeButton.innerHTML = `&lt;/&gt;`;

const syntaxThemeDropdown = document.createElement("div");
syntaxThemeDropdown.className = "syntax-theme-dropdown";

function buildCustomDropdown() {
    syntaxThemeDropdown.innerHTML = "";

    // Create light themes group
    const lightThemesGroup = document.createElement("div");
    lightThemesGroup.className = "theme-group";

    const lightLabel = document.createElement("div");
    lightLabel.className = "theme-group-label";
    lightLabel.textContent = "Light";
    lightThemesGroup.appendChild(lightLabel);

    const lightOptions = document.createElement("div");
    lightOptions.className = "theme-options";
    highlightThemes.light.forEach((theme) => {
        const option = document.createElement("div");
        option.className = "theme-option";
        option.textContent = theme.name;
        option.dataset.value = theme.value;
        if (theme.value === syntaxTheme.value) {
            option.classList.add("selected");
        }
        option.onclick = () => {
            syntaxTheme.value = theme.value;
            localStorage.setItem("xynhtml-syntax-theme", syntaxTheme.value);
            syntaxThemeDropdown.classList.remove("show");
        };
        lightOptions.appendChild(option);
    });
    lightThemesGroup.appendChild(lightOptions);
    syntaxThemeDropdown.appendChild(lightThemesGroup);

    // Create dark themes group
    const darkThemesGroup = document.createElement("div");
    darkThemesGroup.className = "theme-group";

    const darkLabel = document.createElement("div");
    darkLabel.className = "theme-group-label";
    darkLabel.textContent = "Dark";
    darkThemesGroup.appendChild(darkLabel);

    const darkOptions = document.createElement("div");
    darkOptions.className = "theme-options";
    highlightThemes.dark.forEach((theme) => {
        const option = document.createElement("div");
        option.className = "theme-option";
        option.textContent = theme.name;
        option.dataset.value = theme.value;
        if (theme.value === syntaxTheme.value) {
            option.classList.add("selected");
        }
        option.onclick = () => {
            syntaxTheme.value = theme.value;
            localStorage.setItem("xynhtml-syntax-theme", syntaxTheme.value);
            syntaxThemeDropdown.classList.remove("show");
        };
        darkOptions.appendChild(option);
    });
    darkThemesGroup.appendChild(darkOptions);
    syntaxThemeDropdown.appendChild(darkThemesGroup);
}

// Toggle dropdown visibility
syntaxThemeButton.onclick = () => {
    syntaxThemeDropdown.classList.toggle("show");
};

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
    if (!syntaxThemeContainer.contains(e.target)) {
        syntaxThemeDropdown.classList.remove("show");
    }
});

syntaxThemeContainer.appendChild(syntaxThemeButton);
document.getElementById("nav-theme-container").appendChild(syntaxThemeDropdown);

// Global theme effect - only triggers on actual changes
effect(() => {
    localStorage.setItem("xynhtml-theme", globalTheme.value);
    applyGlobalTheme(globalTheme.value);
    if (globalTheme.value === "light") {
        globalThemeButton.classList.add("theme-toggle--toggled");
    } else {
        globalThemeButton.classList.remove("theme-toggle--toggled");
    }
}, [globalTheme]);

// Syntax theme effect - skip transitions on initial load
effect(() => {
    localStorage.setItem("xynhtml-syntax-theme", syntaxTheme.value);
    applySyntaxTheme(syntaxTheme.value, isInitialLoad.value);
    buildCustomDropdown();
}, [syntaxTheme]);

globalThemeSwitcher.appendChild(globalThemeButton);
globalThemeSwitcher.appendChild(syntaxThemeContainer);

// Append to theme selector container if it exists, otherwise to body
const themeContainer = document.getElementById("theme-selector-container");
if (themeContainer) {
    themeContainer.appendChild(globalThemeSwitcher);
} else {
    document.body.appendChild(globalThemeSwitcher);
}

// // Observer to apply theme to newly created example containers
// const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//             mutation.addedNodes.forEach((node) => {
//                 if (node.nodeType === 1) { // Element node
//                     const containers = node.classList?.contains('example-container')
//                         ? [node]
//                         : Array.from(node.querySelectorAll?.('.example-container') || []);

//                     containers.forEach(container => {
//                         const theme = globalTheme.value;
//                         container.className = `example-container theme-${theme}`;
//                         if (theme === 'dark') {
//                             container.style.backgroundColor = '#2d2d2d';
//                             container.style.borderColor = '#555';
//                             container.style.color = '#ffffff';
//                         } else {
//                             container.style.backgroundColor = '#f9f9f9';
//                             container.style.borderColor = '#ddd';
//                             container.style.color = '#000000';
//                         }
//                     });
//                 }
//             });
//         }
//     });
// });

// observer.observe(document.body, {
//     childList: true,
//     subtree: true
// });

// Listen for system theme changes
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
        if (!localStorage.getItem("xynhtml-theme")) {
            const systemTheme = getSystemTheme();
            globalTheme.value = systemTheme;
        }
    });

// Lazy loading for examples
async function loadExamples() {
    const examples = getExamples();
    const timestamp = Date.now();

    // Use Promise.all to wait for all examples to load
    await Promise.all(
        examples.map(async (uri, i) => {
            try {
                const exampleModule = await import(
                    `./${uri}.js?v=${timestamp}`
                );
                const example = Object.values(exampleModule).filter(
                    (v) => typeof v === "function",
                )[0];
                const { title } = exampleModule;
                addExampleTitle(`example${i + 1}-output`, title);
                addSourceCode(`example${i + 1}-output`, example);
                await example(createOutput(`example${i + 1}-output`));
            } catch (err) {
                console.error(`Error loading example ${uri}:`, err);
                console.error(`Error message: ${err.message}`);
                console.error(`Error stack: ${err.stack}`);
            }
        }),
    );
}

// Hamburger menu functionality
function setupHamburgerMenu() {
    const hamburger = document.getElementById("hamburger-menu");
    const nav = document.getElementById("examples-nav");

    if (!hamburger || !nav) return;

    const menuOpen = signal(false);

    hamburger.addEventListener("click", () => {
        menuOpen.value = !menuOpen.value;
    });

    // Effect to toggle classes based on menu state
    effect(() => {
        if (menuOpen.value) {
            hamburger.classList.add("active");
            nav.classList.add("mobile-open");
        } else {
            hamburger.classList.remove("active");
            nav.classList.remove("mobile-open");
        }
    }, [menuOpen]);

    // Close menu when clicking a navigation link
    nav.addEventListener("click", (e) => {
        if (e.target.classList.contains("examples-nav__link--sub")) {
            menuOpen.value = false;
        }
    });
}

// Build sticky navigation bar with scroll-based highlighting
function createExamplesNavigation() {
    const navContainer = document.getElementById("examples-nav");
    if (!navContainer) return;

    // Dynamically extract sections from the DOM
    const sections = [];

    // Find main section headers
    const coreFeaturesHeader = document.getElementById("core-features");
    const extraFeaturesHeader = document.getElementById("extra-features");

    if (coreFeaturesHeader) {
        const coreSubSections = [];
        // Find all h3 elements between core-features and extra-features
        let currentElement = coreFeaturesHeader.nextElementSibling;
        while (currentElement && currentElement !== extraFeaturesHeader) {
            if (currentElement.tagName === "H3" && currentElement.id) {
                coreSubSections.push({
                    id: currentElement.id,
                    label: currentElement.textContent.replace(
                        /^Example \d+:\s*/,
                        "",
                    ),
                });
            }
            currentElement = currentElement.nextElementSibling;
        }

        if (coreSubSections.length > 0) {
            sections.push({
                id: "core-features",
                label: "Core Features",
                subSections: coreSubSections,
            });
        }
    }

    if (extraFeaturesHeader) {
        const extraSubSections = [];
        // Find all h3 elements after extra-features
        let currentElement = extraFeaturesHeader.nextElementSibling;
        while (currentElement) {
            if (currentElement.tagName === "H3" && currentElement.id) {
                extraSubSections.push({
                    id: currentElement.id,
                    label: currentElement.textContent.replace(
                        /^Example \d+:\s*/,
                        "",
                    ),
                });
            }
            currentElement = currentElement.nextElementSibling;
        }

        if (extraSubSections.length > 0) {
            sections.push({
                id: "extra-features",
                label: "Extra Features",
                subSections: extraSubSections,
            });
        }
    }

    // If no sections found, bail out
    if (sections.length === 0) {
        console.warn("No navigation sections found in DOM");
        return;
    }

    // Signals to track state
    const activeMainSection = signal(sections[0].id);
    const activeSubSection = signal(sections[0].subSections[0].id);

    // Create navigation structure
    sections.forEach((section, sectionIndex) => {
        const mainItem = tag`div`;
        mainItem.css.classes`examples-nav__main-item`;
        mainItem.attributes.set("data-section-id", section.id);

        const mainLabel = tag`div`;
        mainLabel.css.classes`examples-nav__link examples-nav__link--main`;
        mainLabel.children.add(text(section.label));

        mainItem.children.add(mainLabel);

        // Create sub-sections container
        const subNav = tag`div`;
        subNav.css.classes`examples-nav__subnav`;

        section.subSections.forEach((subSection) => {
            const subLink = tag`a`;
            subLink.attributes.set("href", `#${subSection.id}`);
            subLink.css.classes`examples-nav__link examples-nav__link--sub`;
            subLink.attributes.set("data-subsection-id", subSection.id);
            subLink.children.add(text(subSection.label));

            const subLinkElement = subLink.render();

            // Sub-section click handler
            subLinkElement.addEventListener("click", (e) => {
                e.preventDefault();
                const targetElement = document.getElementById(subSection.id);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                    activeMainSection.value = section.id;
                    activeSubSection.value = subSection.id;
                }
            });

            subNav.children.add(subLink);
        });

        mainItem.children.add(subNav);
        mountNext(mainItem, navContainer);
    });

    // Effect to update sub-section active states
    effect(() => {
        const subLinks = navContainer.querySelectorAll(
            ".examples-nav__link--sub",
        );
        subLinks.forEach((link) => {
            const subSectionId = link.getAttribute("data-subsection-id");
            if (subSectionId === activeSubSection.value) {
                link.classList.add("examples-nav__link--active");
            } else {
                link.classList.remove("examples-nav__link--active");
            }
        });
    }, [activeSubSection]);

    // Scroll-based detection with dynamic zone calculation
    // For each section with height H, detection zone is 3/4 * H centered on viewport
    // Zone top = 50vh - 3/8*H, Zone bottom = 50vh + 3/8*H
    
    let lastSeenSubSection = sections[0].subSections[0].id;
    let animationFrameId = null;

    function checkSectionVisibility() {
        const viewportHeight = window.innerHeight;
        const viewportCenter = viewportHeight / 2;

        // Check sub-sections
        let closestSubSection = null;
        let closestDistance = Infinity;

        sections.forEach((section) => {
            section.subSections.forEach((subSection) => {
                const element = document.getElementById(subSection.id);
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const elementHeight = rect.height;
                const elementMiddle = rect.top + elementHeight / 2;

                // Detection zone is 3/4 of element height, centered on viewport
                const zoneHeight = (3 / 4) * elementHeight;
                const zoneTop = viewportCenter - zoneHeight / 2;
                const zoneBottom = viewportCenter + zoneHeight / 2;

                // Check if element's middle is in the detection zone
                if (elementMiddle >= zoneTop && elementMiddle <= zoneBottom) {
                    const distanceFromCenter = Math.abs(elementMiddle - viewportCenter);
                    if (distanceFromCenter < closestDistance) {
                        closestDistance = distanceFromCenter;
                        closestSubSection = subSection.id;
                    }
                }
            });
        });

        if (closestSubSection) {
            activeSubSection.value = closestSubSection;
            lastSeenSubSection = closestSubSection;

            // Find and set the main section for this subsection
            sections.forEach((section) => {
                if (section.subSections.some(sub => sub.id === closestSubSection)) {
                    activeMainSection.value = section.id;
                }
            });
        } else {
            // No section in zone, keep last seen
            activeSubSection.value = lastSeenSubSection;
        }
    }

    function onScroll() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        animationFrameId = requestAnimationFrame(checkSectionVisibility);
    }

    // Initial check
    checkSectionVisibility();

    // Listen for scroll events
    window.addEventListener('scroll', onScroll, { passive: true });

    // Cleanup function
    return () => {
        window.removeEventListener('scroll', onScroll);
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };
}

// Start loading examples when DOM is ready and then clean up the event listener
const loadExamplesOnReady = async () => {
    addSourceCode("output-helper", createOutput);
    // Load examples on initial page load and wait for all to complete
    await loadExamples();

    // Now that all examples are loaded and titles are in DOM, create navigation
    createExamplesNavigation();

    // Setup hamburger menu
    setupHamburgerMenu();

    // Mark initial load as complete to enable transitions for future changes
    setTimeout(() => {
        isInitialLoad.value = false;
    }, 100);
    document.removeEventListener("DOMContentLoaded", loadExamplesOnReady);
};
document.addEventListener("DOMContentLoaded", loadExamplesOnReady);
