import { afterEach } from "bun:test";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.window = dom.window as Window & typeof globalThis;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Node = dom.window.Node;

afterEach(() => {
	document.body.innerHTML = "";
});
