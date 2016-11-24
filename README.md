# generator-electron-angular [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]
> 

## Installation

First, install [Yeoman](http://yeoman.io) and generator-electron-angular using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```shell
npm install -g yo
npm install -g generator-electron-angular
```

Then generate your new project:

```shell
yo electron-angular
```
You can always call the generator again for repair or removing project.

#### To get started:

> If during the launch that had fallen, or you **refused(stop)** the installation of modules. **Run pre install**.
```shell
npm run pre-install
```

## console commands
 **RUN** - to run a project
```shell
npm run start
```
> or
```shell
gulp run
```
**PROCESSING** - to make a processing changes
If you wanna, or does not agree with processing rules you may configure a gulpfile. If you wanna just a change/add preprocessor you may look a task **start-inject** and add any of defined processors.


**PRODUCTION** - to make production version of angular project
```shell
gulp dist
```

**BUILD** - to build electron application
You may define your unique command, an example in package.json build. For that case we assume you have pre-installed global [electron-packager](https://www.npmjs.com/package/electron-packager)
```shell
[npm i -g electron-packager]
npm run build
```
The generator offers of several defined ways to build of electron project.
```shell
gulp electrify-win
```
> for make a **Windows** application (ia32,x64)
```shell
gulp electrify-linux
```
> for make a **Linux** application (ia32,x64, armv7l)

```shell
gulp electrify-mas
```
> without warranty of any kind




### Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

### License

Apache-2.0 © [Sajera]()


[npm-image]: https://badge.fury.io/js/generator-electron-angular.svg
[npm-url]: https://npmjs.org/package/generator-electron-angular
[daviddm-image]: https://david-dm.org/sajera/generator-electron-angular.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/sajera/generator-electron-angular
