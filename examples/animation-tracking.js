// Animation tracking example - demonstrates createAnimationState
import { effect, signal, tag, text } from "../src/xyn_html.js";
import { AnimationState, createAnimationState } from "../src/xyn_html_extra.js";

export const title = "Example 14: Animation State Tracking";

export async function example14(output) {
    output(
        "Click the button to trigger an animation and watch the state changes:",
    );

    const stateMessage = signal("⏸️ Animation Unset");

    const animatedBox = tag`div`;
    animatedBox.css.classes`animated-box`;
    animatedBox.children.add(text("Click to Animate"));

    const boxElement = animatedBox.render();
    const animationState = createAnimationState(signal);
    animationState.attachToElement(boxElement);

    const stateDisplay = tag`div.state-display { ""Current State: ${stateMessage}"" }`;

    effect(
        ({ value }) => {
            switch (value) {
                case AnimationState.STARTED:
                    stateMessage.value = "🎬 Animation Started";
                    break;
                case "iteration":
                    stateMessage.value = "🔄 Animation Iteration";
                    break;
                case "ended":
                    stateMessage.value = "✅ Animation Ended";
                    break;
                case "canceled":
                    stateMessage.value = "❌ Animation Canceled";
                    break;
                default:
                    stateMessage.value = "⏸️ Animation Unset";
            }

            output(`Animation State: ${stateMessage.value}`);
        },
        [animationState.state],
    );

    animatedBox.event("click", () => {
        boxElement.style.animation = "none";
        setTimeout(() => {
            boxElement.style.animation = "slideAndSpin 2s ease-in-out";
        }, 10);
    });

    const style = tag`style`;
    style.children.add(
        text(`
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
    `),
    );

    output.append(style);
    output.append(animatedBox);
    output.append(stateDisplay);
}
