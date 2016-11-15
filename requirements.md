# System Requirements

Generally, PhoneGap / Cordova is capable of running on reasonably modest hardware as long as you can test on physical devices. Running your app in a simulator or emulator, however, will require more substantial hardware. Furthermore, if you intend on using an IDE like WebStorm or the like, you'll need a machine capable of running that IDE.

> **Important**: if you plan on building any of the code for iOS and running it on a physical device, you'll need Xcode 7 or better, as well as a recent Mac running OS X 10.11 or better.

## Hardware Requirements

If you intend on using a simulator or an emulator, you'll need reasonable hardware. The following is simply a recommendation, and you may be able to get by on less if you test solely on a physical device.

* Intel-based CPU with virtualization support (VT-x or AMD-V) (64-bit highly recommended)
* 2GB RAM (8GB recommended)
* 1280x800 minimum screen resolution (1920x1080 or better recommended)
* 8GB storage space
* OpenGL 2.0 capable video card for emulators

## Operating System Requirements

The following operating systems can be used:

* Microsoft Windows 7 or better (32 or 64-bit)
* Linux: Any modern distro supporting: GNU C library 2.15+, if 64-bit, must be able to run 32-bit apps. Ubuntu must be 14.04+
* OS X: 10.11 ("El Capitan") or better

> **Important**: To build for iOS, you **must** have OS X, as well as Xcode 7 or better. Building for Android can be done on any of the above platforms.

## Software Requirements

The following software is installed throughout the course of the video, but if you're already familiar with the installation process, the following should help you get up and going quickly:

* ANT 1.9.4 or better; download at <http://ant.apache.org/bindownload.cgi>
* Java 8 Development Kit (JDK) (or better); download at <http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html>.
* Node v5.0.0 or better; download at <https://nodejs.org>, or use NVM <https://github.com/creationix/nvm>.
* Cordova / PhoneGap 6.2.0 or higher; installation instructions at <http://cordova.apache.org> or <http://www.phonegap.com>, and will be addressed in the course.
* Xcode 7 or better for iOS builds; download from the Mac App Store.
* Android SDK (API levels 14 and higher) for Android builds; download at <http://developer.android.com/sdk/index.html>.

## Device Requirements

If you're planning on testing the code for this course on your device, you'll need a device that meets the following minimum requirements:

* Webview capable of executing ES2015 JavaScript

The following devices and OS versions meet this requirement:

* Android Device: Android 5.x or better
* iPhone / iPad: iOS 10 or better
