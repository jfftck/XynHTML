// Basic routing example - demonstrates XynRouter with simple navigation
import { signal, derived, tag, text, mountNext } from "../src/xyn_html.js";
import { XynRouter, route, pathMatcher, basicRouting } from "../src/xyn_html_extra.js";

export const title = "Example 16: Basic Client-Side Routing";

export async function example16(output) {
    output("Click the navigation links to switch between pages (client-side routing):");
    
    const currentRoute = signal("home");
    const router = XynRouter.create(signal, derived);
    
    const nav = tag`nav`;
    nav.css.classes`router-nav`;
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
    
    mountNext(createNavLink("Home", "/"), navElement);
    mountNext(createNavLink("About", "/about"), navElement);
    mountNext(createNavLink("Contact", "/contact"), navElement);
    
    const contentArea = tag`div`;
    contentArea.css.classes`route-content`;
    const contentElement = contentArea.render();
    
    const renderRoute = router.routes(
        route(
            pathMatcher("", ""),
            basicRouting(currentRoute),
            "home"
        ),
        route(
            pathMatcher("", "about"),
            basicRouting(currentRoute),
            "about"
        ),
        route(
            pathMatcher("", "contact"),
            basicRouting(currentRoute),
            "contact"
        )
    );
    
    renderRoute.subscribe(() => {});
    
    currentRoute.subscribe(() => {
        contentArea.children.clear();
        
        const heading = tag`h4`;
        const paragraph = tag`p`;
        
        switch(currentRoute.value) {
            case "home":
                heading.children.add(text("🏠 Home Page"));
                paragraph.children.add(text("Welcome to the home page! This is rendered using XynRouter."));
                output("Navigated to: Home");
                break;
            case "about":
                heading.children.add(text("ℹ️ About Page"));
                paragraph.children.add(text("This is the about page. Learn more about client-side routing with XynHTML!"));
                output("Navigated to: About");
                break;
            case "contact":
                heading.children.add(text("📧 Contact Page"));
                paragraph.children.add(text("Get in touch with us! This page demonstrates path-based routing."));
                output("Navigated to: Contact");
                break;
            default:
                heading.children.add(text("404 Not Found"));
                paragraph.children.add(text("Page not found"));
        }
        
        mountNext(heading, contentElement);
        mountNext(paragraph, contentElement);
    });
    
    const style = tag`style`;
    style.children.add(text(`
        .router-nav {
            display: flex;
            gap: 15px;
            margin: 20px 0;
            padding: 10px;
            background: rgba(66, 153, 225, 0.1);
            border-radius: 5px;
        }
        
        .router-nav a {
            color: #4299e1;
            text-decoration: none;
            padding: 8px 16px;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        
        .router-nav a:hover {
            background-color: rgba(66, 153, 225, 0.2);
        }
        
        [data-theme="dark"] .router-nav a {
            color: #63b3ed;
        }
        
        .route-content {
            padding: 20px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 10px;
            margin: 20px 0;
            min-height: 100px;
        }
        
        .route-content h4 {
            margin-top: 0;
            color: #667eea;
        }
        
        [data-theme="dark"] .route-content h4 {
            color: #9f7aea;
        }
    `));
    
    output.append(style);
    output.append(nav);
    output.append(contentArea);
}
