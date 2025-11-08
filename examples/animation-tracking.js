// Animation tracking example - demonstrates createAnimationState
import { signal, tag, text, mountNext } from "../src/xyn_html.js";
import { setSignal, setDerived, createAnimationState } from "../src/xyn_html_extra.js";

export const title = "Example 14: Animation State Tracking";

export async function example14(output) {
    setSignal(signal);
    
    output("Click the button to trigger an animation and watch the state changes:");
    
    const animatedBox = tag`div`;
    animatedBox.css.classes`animated-box`;
    animatedBox.children.add(text("Click to Animate"));
    
    const boxElement = animatedBox.render();
    const animationStateSignal = createAnimationState(boxElement);
    
    const stateDisplay = tag`div`;
    stateDisplay.css.classes`state-display`;
    
    animationStateSignal.subscribe(() => {
        const stateName = animationStateSignal.value;
        let stateMessage = "";
        
        switch(stateName) {
            case "started":
                stateMessage = "🎬 Animation Started";
                break;
            case "iteration":
                stateMessage = "🔄 Animation Iteration";
                break;
            case "ended":
                stateMessage = "✅ Animation Ended";
                break;
            case "canceled":
                stateMessage = "❌ Animation Canceled";
                break;
            default:
                stateMessage = "⏸️ Animation Unset";
        }
        
        output(`Animation State: ${stateMessage}`);
        stateDisplay.children.clear();
        stateDisplay.children.add(text(`Current State: ${stateMessage}`));
    });
    
    animatedBox.event("click", () => {
        boxElement.style.animation = "none";
        setTimeout(() => {
            boxElement.style.animation = "slideAndSpin 2s ease-in-out";
        }, 10);
    });
    
    const style = tag`style`;
    style.children.add(text(`
        .animated-box {
            width: 200px;
            height: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            cursor: pointer;
            margin: 20px 0;
            font-weight: bold;
            user-select: none;
        }
        
        .state-display {
            padding: 10px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
        }
        
        @keyframes slideAndSpin {
            0% {
                transform: translateX(0) rotate(0deg);
            }
            50% {
                transform: translateX(200px) rotate(180deg);
            }
            100% {
                transform: translateX(0) rotate(360deg);
            }
        }
    `));
    
    output.append(style);
    output.append(animatedBox);
    output.append(stateDisplay);
}
