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
 * Wrapper for logger
 **********************************************************************************************************************/

(function (exports) {

    const PreferenceBranch = "extensions.threadvis.";

    const defaultValues = {
        "extensions.threadvis.disabledaccounts": "",
        "extensions.threadvis.disabledfolders": "",
        "extensions.threadvis.timeline.enabled": true,
        "extensions.threadvis.timeline.fontsize": 9,
        "extensions.threadvis.timescaling.enabled": true,
        "extensions.threadvis.timescaling.method": "linear",
        "extensions.threadvis.timescaling.mintimediff": 0,
        "extensions.threadvis.visualisation.arcminheight": 10,
        "extensions.threadvis.visualisation.arcradius": 10,
        "extensions.threadvis.visualisation.arcdifference": 2,
        "extensions.threadvis.visualisation.arcwidth": 2,
        "extensions.threadvis.visualisation.colour": "author",
        "extensions.threadvis.visualisation.colours.background": "",
        "extensions.threadvis.visualisation.colours.border": "",
        "extensions.threadvis.visualisation.colours.received": "#7FFF00,#00FFFF,#7F00FF,#997200,#009926,#002699,#990072,#990000,#4C9900,#009999,#4C0099,#FFBF00,#00FF3F,#003FFF,#FF00BF",
        "extensions.threadvis.visualisation.colours.sent": "#ff0000",
        "extensions.threadvis.visualisation.colours.current": "#000000",
        "extensions.threadvis.visualisation.dotsize": 10,
        "extensions.threadvis.visualisation.highlight": true,
        "extensions.threadvis.visualisation.minimalwidth": 100,
        "extensions.threadvis.visualisation.spacing": 16,
        "extensions.threadvis.visualisation.opacity": 30,
        "extensions.threadvis.visualisation.messagecircles": true,
        "extensions.threadvis.visualisation.zoom": "full",
        "extensions.threadvis.svg.height": 1000,
        "extensions.threadvis.svg.width": 1000,
        "extensions.threadvis.sentmail.folderflag": true,
        "extensions.threadvis.sentmail.identity": true,
        "extensions.threadvis.visualisation.hideonsingle": false,
    }

    const Preferences = {
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
            "mailnews.database.global.indexer.enabled",

        get: (name) => {
            return browser.runtime.sendMessage({
                command: "getPref",
                name,
                defaultValue: defaultValues[name]
            })
        },

        set: (name, value) => {
            return browser.runtime.sendMessage({
                command: "setPref",
                name,
                value
            })
        }
    };

    // Export what should be available in the importing scope.
    exports.Preferences = Preferences;

})(this)
