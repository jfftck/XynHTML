// Transition tracking example - demonstrates createTransitionState
import { effect, signal, tag, text, mountNext, xyn } from "../src/xyn_html.js";
import { createTransitionState } from "../src/xyn_html_extra.js";

export const title = "Example 15: Transition State Tracking";

export async function example15(output) {
    output("Hover over the box to trigger transitions and track their states:");

    const boxWidth = signal("200px");
    const boxBgColor = signal("#4299e1");
    const currentState = signal("");

    const transitionBox = xyn`div.transition-box { ""Hover Me"" }`;
    transitionBox.get(0).css.styles({
        width: boxWidth,
        "background-color": boxBgColor,
    });

    const transitionState = createTransitionState(signal);
    transitionBox.extend(transitionState);

    const stateDisplay = xyn`div.state-display {
        ""Current State: ${currentState}""
    }`;

    const stateLog = tag`div.state-log`;
    const logElement = stateLog.render();

    effect(() => {
        const stateName = transitionState.state.value;
        let stateMessage = "";
        let emoji = "";

        switch (stateName) {
            case "started":
                stateMessage = "Transition Started";
                emoji = "🎬";
                break;
            case "running":
                stateMessage = "Transition Running";
                emoji = "🔄";
                break;
            case "ended":
                stateMessage = "Transition Ended";
                emoji = "✅";
                break;
            case "canceled":
                stateMessage = "Transition Canceled";
                emoji = "❌";
                break;
            default:
                stateMessage = "Transition Unset";
                emoji = "⏸️";
        }

        const logEntry = xyn`div.log-entry { ""${emoji} ${stateMessage}"" }`;
        currentState.value = `${emoji} ${stateMessage}`;
        mountNext(logEntry, logElement);
    }, [transitionState.state]);

    transitionBox.event("mouseenter", () => {
        boxWidth.value = "300px";
        boxBgColor.value = "#48bb78";
    });

    transitionBox.event("mouseleave", () => {
        boxWidth.value = "200px";
        boxBgColor.value = "#4299e1";
    });

    const style = tag`style`;
    style.children.add(
        text(`
        .transition-box {
            width: 200px;
            height: 100px;
            background-color: #4299e1;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            cursor: pointer;
            margin: 20px 0;
            font-weight: bold;
            user-select: none;
            transition: all 0.5s ease-in-out;
        }
        
        .state-log {
            max-height: 200px;
            overflow-y: auto;
            background: rgba(66, 153, 225, 0.1);
            border-radius: 5px;
            padding: 10px;
            margin: 10px 0;

            counter-reset: log-count 0;
        }

        .state-display {
            padding: 10px;
            background: rgba(66, 153, 225, 0.1);
            border-radius: 5px;
        }
        
        .log-entry {
            padding: 5px;
            margin: 2px 0;
            background: white;
            border-radius: 3px;
            font-size: 14px;

            &::before {
                counter-increment: log-count;
                content: counter(log-count) ". ";
            }
        }
        
        [data-theme="dark"] .log-entry {
            background: #2d3748;
            color: #e2e8f0;
        }
    `),
    );

    output.append(style);
    output.append(transitionBox);
    output.append(stateDisplay);
    output.append(stateLog);
}
