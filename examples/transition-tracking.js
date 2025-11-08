// Transition tracking example - demonstrates createTransitionState  
import { signal, tag, text, mountNext } from "../src/xyn_html.js";
import { setSignal, setDerived, createTransitionState } from "../src/xyn_html_extra.js";

export const title = "Example 15: Transition State Tracking";

export async function example15(output) {
    setSignal(signal);
    
    output("Hover over the box to trigger transitions and track their states:");
    
    const transitionBox = tag`div`;
    transitionBox.css.classes`transition-box`;
    transitionBox.children.add(text("Hover Me"));
    
    const boxElement = transitionBox.render();
    const transitionStateSignal = createTransitionState(boxElement);
    
    const stateLog = tag`div`;
    stateLog.css.classes`state-log`;
    const logElement = stateLog.render();
    
    let logCount = 0;
    transitionStateSignal.subscribe(() => {
        const stateName = transitionStateSignal.value;
        let stateMessage = "";
        let emoji = "";
        
        switch(stateName) {
            case "started":
                stateMessage = "Transition Started";
                emoji = "▶️";
                break;
            case "running":
                stateMessage = "Transition Running";
                emoji = "⏩";
                break;
            case "ended":
                stateMessage = "Transition Ended";
                emoji = "⏹️";
                break;
            case "canceled":
                stateMessage = "Transition Canceled";
                emoji = "⏸️";
                break;
            default:
                stateMessage = "Transition Unset";
                emoji = "⏸️";
        }
        
        output(`${emoji} ${stateMessage}`);
        
        const logEntry = tag`div`;
        logEntry.css.classes`log-entry`;
        logEntry.children.add(text(`${++logCount}. ${emoji} ${stateMessage}`));
        mountNext(logEntry, logElement);
    });
    
    let isExpanded = false;
    transitionBox.event("mouseenter", () => {
        isExpanded = true;
        boxElement.style.width = "300px";
        boxElement.style.backgroundColor = "#48bb78";
    });
    
    transitionBox.event("mouseleave", () => {
        isExpanded = false;
        boxElement.style.width = "200px";
        boxElement.style.backgroundColor = "#4299e1";
    });
    
    const style = tag`style`;
    style.children.add(text(`
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
        }
        
        .log-entry {
            padding: 5px;
            margin: 2px 0;
            background: white;
            border-radius: 3px;
            font-size: 14px;
        }
        
        [data-theme="dark"] .log-entry {
            background: #2d3748;
            color: #e2e8f0;
        }
    `));
    
    output.append(style);
    output.append(transitionBox);
    output.append(stateLog);
}
