const EntityStore = require("./store/EntityStore.js");
const LocalStorageAdapter = require("./store/adapters/LocalStorageAdapter.js");


// Partials
const partials = {
    "navbar:ios": require("../html/partials/navbar-ios.html!text"),
    "navbar:android": require("../html/partials/navbar-android.html!text")
};

const helpers = {
    "render_piece": require("./helpers/render_piece.js"),
}

// Determine theme depending on device
var isAndroid = Framework7.prototype.device.android === true;
var isIos = Framework7.prototype.device.ios === true;

// override if URI is ?ios or ?android
if (window.location.search) {
    isAndroid = window.location.search.indexOf("android") > -1;
    isIos = window.location.search.indexOf("ios") > -1;
}

if (!isIos && !isAndroid) {
    isIos = true;
}

// Set Template7 global devices flags
Template7.global = {
    android: isAndroid,
    ios: isIos
};

//
// Register all helpers
for (let helper of Object.keys(helpers)) {
    Template7.registerHelper(helper, helpers[helper]);
}

//
// register all the partials that our templates will need
for (let partial of Object.keys(partials)) {
    Template7.registerPartial(partial, partials[partial]);
}

// Pages
const NotesPage = require("./pages/NotesPage.js");
const NotePage = require("./pages/NotePage.js");
const AboutPage = require("./pages/AboutPage.js");

// switch app style based on device OS
// copied from: https://framework7.io/tutorials/maintain-both-ios-and-material-themes-in-single-app.html
(function () {
    if (isAndroid) {
        Dom7('head').append(
            `<link rel="stylesheet" href="./lib/framework7/css/framework7.material.min.css">
             <link rel="stylesheet" href="./lib/framework7/css/framework7.material.colors.min.css">` 
        );
    }
    else {
        Dom7('head').append(
            `<link rel="stylesheet" href="./lib/framework7/css/framework7.ios.min.css">
             <link rel="stylesheet" href="./lib/framework7/css/framework7.ios.colors.min.css">`
        );
    }
    Dom7('head').append(`
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/notesPage.css">
    <link rel="stylesheet" href="css/notePage.css">
    `);
})();

var $$ = Dom7;

let app = new Framework7({
    material: isAndroid ? true : false,
    template7Pages: true
});
if (window) { window.app = app; }

app.go = function (page, {animate = true} = {}) {
    if (page.init) {
        page.init.call(page);
    }
    let pageCallbacks = {};
    ["onPageInit", "onPageBeforeInit", "onPageReinit", "onPageBeforeAnimation",
        "onPageAfterAnimation", "onPageBeforeRemove", "onPageBack", "onPageAfterBack"].forEach(
        (pageCallback) => {
            pageCallbacks[pageCallback] = window.app[pageCallback](page.name, (...args) => {
                if (page[pageCallback]) {
                    if (app.DEBUG) { console.log("calling", pageCallback, page.name); }
                    page[pageCallback].apply(page, args);
                }
            });
        }
        );
    let removeHandler = window.app.onPageAfterBack(page.name, () => {
        for (let pageCallback of Object.keys(pageCallbacks)) {
            if (app.DEBUG) { console.log("Removing", page.name, pageCallback); }
            pageCallbacks[pageCallback].remove();
        }
        removeHandler.remove();
        if (page.destroy) {
            page.destroy.call(page);
        }
    });

    app.mainView.router.load({
        template: page.template,
        context: page.context,
        animatePages: animate
    });
}

app.goBack = function () {
    app.mainView.router.back();
}

app.DEBUG = true;


// start!
function startApp() {
    setTimeout(function () {

        // acquire the entity store
        app.store = EntityStore.make(LocalStorageAdapter.make());

        // Add main view
        app.mainView = app.addView('.view-main', {
            dynamicNavbar: true  // iOS-style navigation bar; ignored on Android
        });

        // get and render the main page
        let notesPage = NotesPage.make({
            store: app.store
        });

        app.go(notesPage, { animate: false });

        if (isAndroid) {
            // We need to adjust the DOM slightly if we're running on Android
            $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
            $$('.view-main > .navbar').remove();
        }

        document.addEventListener("backbutton", (e) => {
            let numPagesInDOM = $$(".page").length;
            if (numPagesInDOM>1) {
                window.app.goBack();
            } else {
                navigator.app.exitApp();
            }
            e.preventDefault();
        }, false);

    }, 100);
}

// If we're running under Cordova, we need to wait for deviceready
// But if we aren't, we'd end up waiting forever... let's avoid that
if (typeof cordova !== "undefined") {
    $$(document).on("deviceready", startApp);
} else {
    startApp();
}

module.exports = app;