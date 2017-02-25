const $$ = window.Dom7;

const PAGESEL = `.page[data-page="about"]`;

const _template = Template7.compile(require("../../html/pages/about.html"));

let _compiledTemplate;

class AboutPage {

    constructor() {
        this.name = "about";
        this.template = _template;
        this.context = {
            name: this.name,
            pageTitle: "About"
        };
    }

    static make() {
        return new AboutPage();
    }

}

module.exports = AboutPage;
