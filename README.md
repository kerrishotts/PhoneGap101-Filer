# Filer (PhoneGap 101 Video Course)

_Filer_ is a simple memory app -- it allows the user to store notes that they consider important and recall them whenever they want.

While simple, the app introduces the developer to the following topics:

* The Framework7 framework
* Supporting both Android and iOS themes in the same app
* Building a persistent data store
* Creating the app's user interface, including pages and navigation between pages (routing)
* Event emitters

The app uses the ES2015 flavor of JavaScript. Although it is possible to transpile this code to ES5 and thus support additional devices, due to the length of the course and existing dependencies, we decided to skip that step for now. This makes the most sense in a build automation step, which we'll cover in future courses.

As such, the app requires a modern iOS or Android device in order to run.

You can play with the Android version of the app at: https://appetize.io/app/gerd88zkwec27r44n32uxkxt7r

Alternatively you can use an online version with a specific theme (below) using your browser (ES2015 required). Swipe gestures a bit fussy on desktops unless you enable touch-only gestures. However the core functionality does work.

* [Android theme](https://photokandy.com/supporting/videos/phonegap-101/?android)
* [iOS theme](https://photokandy.com/supporting/videos/phonegap-101/?android)

> Note: If this is your first time loading the app, give it a couple seconds to start up, especially on slower connections.

## System Requirements

Please see [requirements.md](./requirements.md).

## Device Requirements

The device must be capable of supplying a web view that can execute ES2015 JavaScript. The following operating systems support this:

* iOS 10+
* Android 5.0+

## Dependencies

### System dependencies

* Node 5 or better (I have v6.4.0)
* NPM 3 or better (I have 3.10.8)
* Mocha 3 or better (if you want to run tests; I have 3.10.8)

### Library Dependencies

* Framework7: located at www/lib/framework7
* SystemJS: located at www/lib/systemjs
* SVG Injector: located at www/lib/svg-injector

## Building


### Node scripts

Before executing any of these scripts, ensure that you execute `npm install`.

* `npm test`: executes the small test suite included with the app. All tests should pass.
* `npm run serve`: starts a simple web server. You can navigate to the address displayed in order to test the app in your browser.

### PhoneGap CLI commands

> Note: If you elect to install the Cordova CLI instead, you can replace `phonegap` below with `cordova`.

* `phonegap run ios --device` will create an iOS build suitable for execution on your iOS device. You will need to configure signing appropriately -- you can do this in Xcode or using `build.json` (see http://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html#signing-an-app)
    * If you'd prefer to use the simulator, `phonegap emulate ios` is sufficient.
* `phonegap build android --device` will create an Android build suitable for execution on your Android device.
    * If you'd prefer to use an emulator, `phonegap emulate android` will work unless you use a third-party emulator like GenyMotion. In the latter case, start your emulator first, and then use `phonegap run android --device`.
 