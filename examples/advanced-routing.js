// Advanced routing example - demonstrates path parameters and exact matching
import { signal, derived, tag, text, mountNext } from "../src/xyn_html.js";
import { XynRouter, route, pathMatcher, exactRouting } from "../src/xyn_html_extra.js";

export const title = "Example 17: Advanced Routing with Path Parameters";

export async function example17(output) {
    output("Advanced routing with path parameters and exact matching:");
    
    const currentRoute = signal(null);
    const router = XynRouter.create(signal, derived);
    
    const nav = tag`nav`;
    nav.css.classes`advanced-router-nav`;
    const navElement = nav.render();
    
    const createNavLink = (label, path) => {
        const link = tag`a`;
        link.attributes.set("href", path);
        link.children.add(text(label));
        link.event("click", (e) => {
            e.preventDefault();
            router.pathname = path;
        });
        return link;
    };
    
    mountNext(createNavLink("Dashboard", "/dashboard"), navElement);
    mountNext(createNavLink("User #42", "/user/42"), navElement);
    mountNext(createNavLink("User #123", "/user/123"), navElement);
    mountNext(createNavLink("Settings", "/settings"), navElement);
    
    const contentArea = tag`div`;
    contentArea.css.classes`advanced-route-content`;
    const contentElement = contentArea.render();
    
    const userIdParam = { value: null };
    
    const renderRoute = router.routes(
        route(
            pathMatcher("", "dashboard"),
            exactRouting(currentRoute),
            "dashboard"
        ),
        route(
            pathMatcher("", "user", userIdParam),
            ({ isExact }) => {
                currentRoute.value = isExact ? "user" : null;
            },
            "user"
        ),
        route(
            pathMatcher("", "settings"),
            exactRouting(currentRoute),
            "settings"
        )
    );
    
    renderRoute.subscribe(() => {});
    
    currentRoute.subscribe(() => {
        contentArea.children.clear();
        
        const heading = tag`h4`;
        const paragraph = tag`p`;
        
        switch(currentRoute.value) {
            case "dashboard":
                heading.children.add(text("📊 Dashboard"));
                paragraph.children.add(text("Welcome to your dashboard! This route uses exact matching."));
                output("Navigated to: Dashboard");
                break;
            case "user":
                heading.children.add(text(`👤 User Profile #${userIdParam.value}`));
                paragraph.children.add(text(`Viewing details for user ID: ${userIdParam.value}. This demonstrates path parameters!`));
                output(`Navigated to: User Profile (ID: ${userIdParam.value})`);
                break;
            case "settings":
                heading.children.add(text("⚙️ Settings"));
                paragraph.children.add(text("Configure your application settings here."));
                output("Navigated to: Settings");
                break;
            default:
                heading.children.add(text("🔍 Select a Route"));
                paragraph.children.add(text("Click a navigation link above to see routing in action."));
        }
        
        mountNext(heading, contentElement);
        mountNext(paragraph, contentElement);
    });
    
    const infoBox = tag`div`;
    infoBox.css.classes`info-box`;
    const infoBoxElement = infoBox.render();
    const infoText = tag`p`;
    infoText.children.add(text("💡 Try navigating to /user/999 by clicking User links above. The path parameter is extracted automatically!"));
    mountNext(infoText, infoBoxElement);
    
    const style = tag`style`;
    style.children.add(text(`
        .advanced-router-nav {
            display: flex;
            gap: 15px;
            margin: 20px 0;
            padding: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 5px;
            flex-wrap: wrap;
        }
        
        .advanced-router-nav a {
            color: white;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 5px;
            font-weight: bold;
            background: rgba(255, 255, 255, 0.2);
            transition: background-color 0.2s;
        }
        
        .advanced-router-nav a:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .advanced-route-content {
            padding: 20px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 10px;
            margin: 20px 0;
            min-height: 100px;
        }
        
        .advanced-route-content h4 {
            margin-top: 0;
            color: #667eea;
        }
        
        [data-theme="dark"] .advanced-route-content h4 {
            color: #9f7aea;
        }
        
        .info-box {
            background: rgba(72, 187, 120, 0.1);
            border-left: 4px solid #48bb78;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        
        .info-box p {
            margin: 0;
            color: #2f855a;
        }
        
        [data-theme="dark"] .info-box p {
            color: #68d391;
        }
    `));
    
    output.append(style);
    output.append(nav);
    output.append(contentArea);
    output.append(infoBox);
}
