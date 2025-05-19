"use strict";
// This file is intentionally minimal for the demo
// In a real application, this would contain secure context bridges
window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element)
            element.innerText = text;
    };
    for (const dependency of ["chrome", "node", "electron"]) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
//# sourceMappingURL=preload.js.map