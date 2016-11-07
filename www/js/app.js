const EntityStore = require("./store/EntityStore.js");
const LocalStorageAdapter = require("./store/adapters/LocalStorageAdapter.js");

// Pages
const NotesPage = require("js/pages/NotesPage.js");
const NotePage = require("js/pages/NotePage.js");
const AboutPage = require("js/pages/AboutPage.js");

// Partials
const partials = {
    "navbar:ios": require("/html/partials/navbar-ios.html!text"),
    "navbar:android": require("/html/partials/navbar-android.html!text"),
    "textPiece": require("/html/partials/textPiece.html!text")
};

// Page templates
const templates = {
    notesPage: require("/html/pages/notes.html!text"),
    notePage: require("/html/pages/note.html!text")
};


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
// register all the partials that our templates will need
for (let partial of Object.keys(partials)) {
    Template7.registerPartial(partial, partials[partial]);
}

// switch app style based on device OS
// copied from: https://framework7.io/tutorials/maintain-both-ios-and-material-themes-in-single-app.html
(function () {
    if (isAndroid) {
        Dom7('head').append(
            '<link rel="stylesheet" href="./lib/framework7/css/framework7.material.min.css">' +
            '<link rel="stylesheet" href="./lib/framework7/css/framework7.material.colors.min.css">' +
            '<link rel="stylesheet" href="./css/my-app.material.css">'
        );
    }
    else {
        Dom7('head').append(
            '<link rel="stylesheet" href="./lib/framework7/css/framework7.ios.min.css">' +
            '<link rel="stylesheet" href="./lib/framework7/css/framework7.ios.colors.min.css">' +
            '<link rel="stylesheet" href="./css/my-app.ios.css">'
        );
    }
})();

var $$ = Dom7;

// this is so we can export to window for debugging
let app = new Framework7({
    material: isAndroid ? true : false,
    template7Pages: true
});
if (window) { window.app = app; }

// If we're running under Cordova, we need to wait for deviceready
// But if we aren't, we'd end up waiting forever... let's avoid that
if (typeof cordova !== "undefined") {
    $$(document.on("deviceready"), startApp);
} else {
    setTimeout(startApp, 50);
}

// require all the page logic so that they can react when their respective html
// is loaded

// start!
function startApp() {

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

    app.go(notesPage, {animate: false});

    if (isAndroid) {
        // We need to adjust the DOM slightly if we're running on Android
        $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        //$$('.view .navbar').prependTo('.view .page');
        $$('.view-main > .navbar').remove();
    }
}

app.go = function (page, {animate = true} = {}) {
    let pageCallbacks = {};
    ["onPageInit", "onPageBeforeInit", "onPageReinit", "onPageBeforeAnimation", 
     "onPageAfterAnimation", "onPageBeforeRemove", "onPageBack", "onPageAfterBack"].forEach(
         (pageCallback) => {
             pageCallbacks[pageCallback] = window.app[pageCallback](page.name, (...args) => {
                 if (page[pageCallback]) {
                    page[pageCallback].apply(page, args);
                 }
             });
         }
    );
    let onPageBeforeRemove = window.app.onPageBeforeRemove(page.name, () => {
        for (let pageCallback of Object.keys(pageCallbacks)) {
            pageCallbacks[pageCallback].remove();
        }
        onPageBeforeRemove.remove();
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
 

module.exports = app;