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
 * Register experiment to access preferences in options.js
 **********************************************************************************************************************/

(function (exports) {

    var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
    var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

    var PreferenceBranch = "extensions.threadvis.";

    /**
     * Preference names
     */
    var PreferenceKeys = {
        // list of disabled accounts
        DISABLED_ACCOUNTS:
            PreferenceBranch + "disabledaccounts",

        // list of disabled folders
        DISABLED_FOLDERS:
            PreferenceBranch + "disabledfolders",

        // check for "sent" by folder flag
        SENTMAIL_FOLDERFLAG:
            PreferenceBranch + "sentmail.folderflag",

        // check for "sent" by identity
        SENTMAIL_IDENTITY:
            PreferenceBranch + "sentmail.identity",

        // height of SVG export image
        SVG_HEIGHT:
            PreferenceBranch + "svg.height",

        // width of SVG export image
        SVG_WIDTH:
            PreferenceBranch + "svg.width",

        // show timeline
        TIMELINE:
            PreferenceBranch + "timeline.enabled",

        // font size of timeline
        TIMELINE_FONTSIZE:
            PreferenceBranch + "timeline.fontsize",

        // enable timescaling
        TIMESCALING:
            PreferenceBranch + "timescaling.enabled",

        // timescaling method
        TIMESCALING_METHOD:
            PreferenceBranch + "timescaling.method",

        // minimal timedifference to show
        TIMESCALING_MINTIMEDIFF:
            PreferenceBranch + "timescaling.mintimediff",

        // size of dot
        VIS_DOTSIZE:
            PreferenceBranch + "visualisation.dotsize",

        // minimum height of arc
        VIS_ARC_MINHEIGHT:
            PreferenceBranch + "visualisation.arcminheight",

        // radius of arc
        VIS_ARC_RADIUS:
            PreferenceBranch + "visualisation.arcradius",

        // height difference between two arcs
        VIS_ARC_DIFFERENCE:
            PreferenceBranch + "visualisation.arcdifference",

        // arc width
        VIS_ARC_WIDTH:
            PreferenceBranch + "visualisation.arcwidth",

        // spacing
        VIS_SPACING:
            PreferenceBranch + "visualisation.spacing",

        // message circles
        VIS_MESSAGE_CIRCLES:
            PreferenceBranch + "visualisation.messagecircles",

        // colour
        VIS_COLOUR:
            PreferenceBranch + "visualisation.colour",

        // background color
        VIS_COLOURS_BACKGROUND:
            PreferenceBranch + "visualisation.colours.background",

        // border color
        VIS_COLOURS_BORDER:
            PreferenceBranch + "visualisation.colours.border",

        // colours for received
        VIS_COLOURS_RECEIVED:
            PreferenceBranch + "visualisation.colours.received",

        // colours for sent
        VIS_COLOURS_SENT:
            PreferenceBranch + "visualisation.colours.sent",

        // colour for marking current message
        VIS_COLOURS_CURRENT:
            PreferenceBranch + "visualisation.colours.current",

        // hide if only one message shown
        VIS_HIDE_ON_SINGLE:
            PreferenceBranch + "visualisation.hideonsingle",

        // highlight message
        VIS_HIGHLIGHT:
            PreferenceBranch + "visualisation.highlight",

        // minimal width of visualisation
        VIS_MINIMAL_WIDTH:
            PreferenceBranch + "visualisation.minimalwidth",

        // opacity
        VIS_OPACITY:
            PreferenceBranch + "visualisation.opacity",

        // zoom
        VIS_ZOOM:
            PreferenceBranch + "visualisation.zoom",

        // global message index (Thunderbird internal)
        GLODA_ENABLED:
            "mailnews.database.global.indexer.enabled"
    };

    function pref(aName, aDefault) {
        let defaults = Services.prefs.getDefaultBranch("");
        switch (typeof aDefault) {
            case "string":
                return defaults.setStringPref(aName, aDefault);

            case "number":
                return defaults.setIntPref(aName, aDefault);

            case "boolean":
                return defaults.setBoolPref(aName, aDefault);

            default:
                throw new Error(
                    "Preference <" +
                    aName +
                    "> has an unsupported type <" +
                    typeof aDefault +
                    ">. Allowed are string, number and boolean."
                );
        }
    };

    const PREF_BOOL = Services.prefs.PREF_BOOL;
    const PREF_INT = Services.prefs.PREF_INT;
    const PREF_STRING = Services.prefs.PREF_STRING;

    class PreferencesClass {

        /**
         * Constructor
         */
        constructor() {
            /**
             * Internal preferences object
             */
            this.preferences = {};

            /**
             * Branch of threadvis preferences
             */
            this.threadVisPrefBranch = Services.prefs.getBranch(PreferenceBranch);

            /**
             * Branch for gloda preference
             */
            this.glodaPrefBranch = Services.prefs.getBranch("mailnews.database.global.indexer.enabled");
        }

        /**
         * Do callbacks after preference change
         * 
         * @param {String} pref - The pref that changed
         */
        doCallback(pref) {
            const value = this.preferences[pref].value;
            const callbacks = this.preferences[pref].callbacks;
            for (let key in callbacks) {
                callbacks[key](value);
            }
        }

        /**
         * Get preference value for given preference
         * 
         * @param {String} pref - The preference to get
         * @return {String} - The value of the preference
         */
        get(pref) {
            return this.preferences[pref].value;
        }

        /**
         * Load a preference from the store
         * 
         * @param {String} pref - The preference to load
         * @param {PrefType} type - The type of the preference (bool, string, int)
         * @param {String} def - The default value
         * @param {nsIPrefBranch} prefBranch - The branch to use to read the value
         */
        load(pref, type, def, prefBranch) {
            if (!prefBranch) {
                prefBranch = this.threadVisPrefBranch;
            }
            if (this.preferences[pref] == null) {
                this.preferences[pref] = {
                    value: def,
                    callbacks: [],
                    type: type,
                    branch: prefBranch
                };
            }

            // remove leading branch from pref name
            const loadPref = pref.substring(this.preferences[pref].branch.root.length);

            // check if we are loading right pref type
            if (this.preferences[pref].branch.getPrefType(loadPref) != type) {
                return;
            }

            switch (type) {
                case PREF_BOOL:
                    this.preferences[pref].value = this.preferences[pref].branch.getBoolPref(loadPref);
                    break;
                case PREF_STRING:
                    this.preferences[pref].value = this.preferences[pref].branch.getCharPref(loadPref);
                    break;
                case PREF_INT:
                    this.preferences[pref].value = this.preferences[pref].branch.getIntPref(loadPref);
                    break;
            }
        }

        /**
         * Reload preferences
         */
        reload() {
            this.load(PreferenceKeys.DISABLED_ACCOUNTS, PREF_STRING, "");
            this.load(PreferenceKeys.DISABLED_FOLDERS, PREF_STRING, "");
            this.load(PreferenceKeys.SENTMAIL_FOLDERFLAG, PREF_BOOL, true);
            this.load(PreferenceKeys.SENTMAIL_IDENTITY, PREF_BOOL, true);
            this.load(PreferenceKeys.SVG_HEIGHT, PREF_INT, 1000);
            this.load(PreferenceKeys.SVG_WIDTH, PREF_INT, 1000);
            this.load(PreferenceKeys.TIMELINE, PREF_BOOL, true);
            this.load(PreferenceKeys.TIMELINE_FONTSIZE, PREF_INT, 9);
            this.load(PreferenceKeys.TIMESCALING, PREF_BOOL, true,);
            this.load(PreferenceKeys.TIMESCALING_METHOD, PREF_STRING, "linear");
            this.load(PreferenceKeys.TIMESCALING_MINTIMEDIFF, PREF_INT, 0);
            this.load(PreferenceKeys.VIS_DOTSIZE, PREF_INT, 12);
            this.load(PreferenceKeys.VIS_ARC_MINHEIGHT, PREF_INT, 12);
            this.load(PreferenceKeys.VIS_ARC_RADIUS, PREF_INT, 32);
            this.load(PreferenceKeys.VIS_ARC_DIFFERENCE, PREF_INT, 6);
            this.load(PreferenceKeys.VIS_ARC_WIDTH, PREF_INT, 2);
            this.load(PreferenceKeys.VIS_SPACING, PREF_INT, 24);
            this.load(PreferenceKeys.VIS_MESSAGE_CIRCLES, PREF_BOOL, true);
            this.load(PreferenceKeys.VIS_COLOUR, PREF_STRING, "author");
            this.load(PreferenceKeys.VIS_COLOURS_BACKGROUND, PREF_STRING, "");
            this.load(PreferenceKeys.VIS_COLOURS_BORDER, PREF_STRING, "");
            this.load(PreferenceKeys.VIS_COLOURS_RECEIVED, PREF_STRING,
                "#7FFF00,#00FFFF,#7F00FF,#997200,#009926,#002699,#990072,#990000,#4C9900,#009999,#4C0099,#FFBF00,#00FF3F,#003FFF,#FF00BF");
            this.load(PreferenceKeys.VIS_COLOURS_SENT, PREF_STRING, "#ff0000");
            this.load(PreferenceKeys.VIS_COLOURS_CURRENT, PREF_STRING, "#000000");
            this.load(PreferenceKeys.VIS_HIDE_ON_SINGLE, PREF_BOOL, false);
            this.load(PreferenceKeys.VIS_HIGHLIGHT, PREF_BOOL, true);
            this.load(PreferenceKeys.VIS_MINIMAL_WIDTH, PREF_INT, 0);
            this.load(PreferenceKeys.VIS_OPACITY, PREF_INT, 30);
            this.load(PreferenceKeys.VIS_ZOOM, PREF_STRING, "full");

            this.load(PreferenceKeys.GLODA_ENABLED, PREF_BOOL, true, this.glodaPrefBranch);
        }

        /**
         * Register as preference changing observer
         */
        register() {
            // add observer for our own branch
            this.threadVisPrefBranch.addObserver("", this, false);

            // add observer for gloda
            this.glodaPrefBranch.addObserver("", this, false);
        }

        /**
         * Observe a pref change
         * @param {String} subject
         * @param {String} topic
         * @param {*} data
         */
        observe(subject, topic, data) {
            if (topic != "nsPref:changed") {
                return;
            }
            // reload preferences
            this.reload();
            if (subject.root === "mailnews.database.global.indexer.enabled") {
                this.doCallback("mailnews.database.global.indexer.enabled");
            } else {
                this.doCallback(PreferenceBranch + data);
            }
        }

        /**
         * Register a callback hook
         * 
         * @param {String} preference - The preference
         * @param {Function} func - The function that has to be called if the preference value changes
         */
        callback(preference, func) {
            this.preferences[preference].callbacks.push(func);
        }

        /**
         * Set preference value for given preference
         * 
         * @param {String} pref - The name of the preference
         * @param {String} val - The value of the preference
         */
        set(pref, val) {
            this.preferences[pref].value = val;
            this.storePreference(pref, val);
        }

        /**
         * Store a preference to the store
         * 
         * @param {String} pref - The name of the preference
         * @param {String} val - The value of the preference
         */
        storePreference(pref, val) {
            const branch = this.preferences[pref].branch;
            const type = this.preferences[pref].type;
            // remove leading branch from pref name
            pref = pref.substring(branch.root.length);

            switch (type) {
                case PREF_BOOL:
                    branch.setBoolPref(pref, val);
                    break;
                case PREF_STRING:
                    branch.setCharPref(pref, val);
                    break;
                case PREF_INT:
                    branch.setIntPref(pref, val);
                    break;
            }
        }

        /**
         * Unregister observer
         */
        unregister() {
            this.threadVisPrefBranch.removeObserver("", this);
            this.glodaPrefBranch.removeObserver("", this);
        }
    }

    var Preferences = Object.assign(new PreferencesClass(), PreferenceKeys);

    var LegacyPref = class extends ExtensionCommon.ExtensionAPI {
        onShutdown(isAppShutdown) {
            if (isAppShutdown) {
                return;
            }
            Preferences.unregister();
        }
        getAPI(context) {
            return {
                LegacyPref: {
                    get(name) {
                        return Preferences.get(name, defaultValue);
                    },
                    set(name, value) {
                        Preferences.set(name, value);
                    }
                }
            }
        }
    }    

    // Export what should be available in the importing scope.
    exports.LegacyPref = LegacyPref;

})(this);
