const $$ = window.Dom7;
const app = window.app;

$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    console.log("HI");
    app.alert('Here comes About page');
});