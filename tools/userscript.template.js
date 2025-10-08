// ==UserScript==
// @name         MyInfoMinus
// @namespace    https://github.com/FlamedDogo99/MyMSU-
// @version      1.0.1
// @description  Styles MyMSU like MyInfo
// @author       FlamedDogo99
// @match        https://experience.elluciancloud.com/montana*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=montana.edu
// @updateURL    https://raw.githubusercontent.com/FlamedDogo99/MyMSU-/refs/heads/main/userscript/myinfominus.user.js
// @installURL   https://raw.githubusercontent.com/FlamedDogo99/MyMSU-/refs/heads/main/userscript/myinfominus.user.js
// @downloadURL  https://raw.githubusercontent.com/FlamedDogo99/MyMSU-/refs/heads/main/userscript/myinfominus.user.js
// ==/UserScript==

(function () {
  "use strict";

  function addStylesheet(css) {
    const style = document.createElement("style");
    style.id = "MyMSU Stylesheet";
    style.setAttribute("type", "text/css");
    style.textContent = css;
    (document.body || document.documentElement).appendChild(style);
  }

  addStylesheet(`
//MyMSU-STYLE
  `);
})();
