/* *********************************************************************************************************************
 * This file is part of ThreadVis.
 * https://threadvis.github.io
 *
 * ThreadVis started as part of Alexander C. Hubmann-Haidvogel's Master's Thesis titled
 * "ThreadVis for Thunderbird: A Thread Visualisation Extension for the Mozilla Thunderbird Email Client"
 * at Graz University of Technology, Austria. An electronic version of the thesis is available online at
 * https://ftp.isds.tugraz.at/pub/theses/ahubmann.pdf
 *
 * Copyright (C) 2005, 2006, 2007 Alexander C. Hubmann
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2018, 2019, 2020, 2021, 2022 Alexander C. Hubmann-Haidvogel
 *
 * ThreadVis is free software: you can redistribute it and/or modify it under the terms of the
 * GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * ThreadVis is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with ThreadVis.
 * If not, see <http://www.gnu.org/licenses/>.
 *
 * Version: $Id$
 * *********************************************************************************************************************
 * Main background script for the WebExtension
 **********************************************************************************************************************/

(async () => {

    messenger.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message && message.hasOwnProperty("command")) {
            switch (message.command) {
                case "getThreadVisData":
                    {
                        let msg = await messenger.messageDisplay.getDisplayedMessage(sender.tab.id);
                        return Promise.resolve({ text: "TEXT" });
                    }

                // The message display script cannot directly call the Experiment,
                // pipe through runtime messaging. We use it for the options script
                // as well, so this is the only place where the actual storage backend
                // is used: Only this needs to be updated when moving from legacy pref
                // storage to local storage.
                case "getPref":
                    return browser.LegacyPrefs.getPref(message.name, message.defaultValue);

                case "setPref":
                    return browser.LegacyPrefs.setPref(message.name, message.value);

                // The message display script cannot directly call the identities API,
                // pipe through runtime messaging.
                case "getIdentitites":
                    return browser.identities.list();
                
                case "getAccounts":
                    return browser.accounts.list();
            }
        }
    });

    // Only loads into new messages, so on install, it will not load into the
    // already open message (we could use the onInstall event and manually execute).
    // Sadly we cannot use ES6 modules with message display scripts.
    await messenger.messageDisplayScripts.register({
        js: [
            { file: "modules/preferences.js" },
            { file: "modules/strings.js" },
            { file: "modules/date.js" }, // date depends on strings.js
            { file: "modules/logger.js" },
            { file: "modules/number.js" },
            { file: "modules/color.js" },
            { file: "modules/references.js" },
            { file: "modules/sentmailidentities.js" },

            { file: "display/threadVis.js" }
        ],
        css: [
            { file: "display/threadVis.css" }
        ],
    });

})();
