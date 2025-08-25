import { XynHTML } from "./xyn_html.js";
import { XynTag, text } from "./xyn_html.js";

/**
 * Parses a single HTML string into XynHTML elements.
 * @param {string} html_string - The HTML string to parse.
 * @param {XynHTML.signal[]} values - The values to interpolate into the HTML string.
 * @returns {HTMLCollection} - The parsed XynHTML elements.
 */
function parseHTMLString(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return doc.body.children;
}

/**
 * @param {HTMLCollection} elements
 * @param {XynHTML.signal[]} values
 * @returns {XynTag[]}
 */
function parseHTML(elements, values) {
    /** @type {XynTag[]} */
    const html_tags = [];

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element.nodeType === Node.TEXT_NODE) {
            if (element.textContent.trim().startsWith("\"$")) {
                const value_index = parseInt(element.textContent.trim().slice(2));
                html_tags.push(text`${values[value_index]}`);
            }
            html_tags.push(text`${element.textContent}`);
        }

        const xyn_tag = new XynTag(element.tagName);

        xyn_tag.attributes = element.getAttributeNames().reduce((acc, name) => {
            if (element.getAttribute(name).startsWith("\"$")) {
                const value_index = parseInt(element.getAttribute(name).slice(2));
                acc.set(name, values[value_index]);

                return acc;
            }
            const value = element.getAttribute(name);
            acc.set(name, {get value() { return value; }});

            return acc;
        }, new Map());

        xyn_tag.children = parseHTML(
            parseHTMLString(element.innerHTML),
            values
        );

        html_tags.push(xyn_tag);
    }

    return html_tags;
}

class XynHTMLParser {
    /**
     * Parses HTML strings into XynHTML elements.
     * @param {string[]} html_strings - The HTML strings to parse.
     * @param {XynHTML.signal[]} values - The values to interpolate into the HTML strings.
     */
    static parse(html_strings, ...values) {
        /** @type {string[]} */
        const html_fragments = [];
        html_strings.forEach((html_string, index) => {
            html_fragments.push(html_string);
            if (index < values.length) {
                html_fragments.push(`"\$${index}"`);
            }
        });

        return parseHTML(
            parseHTMLString(html_fragments.join('')), 
            values
        );
    }

    /**
     * Parses the body of a request into XynHTML elements.
     * @param {XynHTML.signal[]} values - The values to interpolate into the body.
     */
    static parseBody(...values) {
        return parseHTML()
    }
}

/** @type {typeof XynHTMLParser.parse} */
export const html = XynHTMLParser.parse;