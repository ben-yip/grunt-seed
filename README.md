# Intro
- This is a Grunt workflow to build static websites.     
- The goal is to provide a neater developing experience other than having trouble managing all the resources manually, including minimal support for modern frontend technique and modular-style development.      
- While Webpack is more capable of managing asset dependency, you may only use this workflow in small projects, or one that needs to support IE8- (Webpack is not friendly with IE8- because of ES5 supporting issues). Otherwise, use Webpack instead! See my project [webpack-seed](https://github.com/ben-yip/webpack-seed).

# Feature
- In this workflow, every page is regarded and managed as a module, which means all the assets relating to a page could be placed under the same folder.
- Supports **HTML partials**: A page could be broken down into many parts(`.html` files), then those reusable html fragments (say the header or footer) are now maintained in a single copy, rather than copy-and-paste the same content into every page.
- Supports **Sass**: Feel free to use variables and mixins!
- Supports **Babel**: Use ES6 features as you wish!

## Dependencies Management
- In `.html` files, while using SASS, you still need to refer the stylesheets end in `.css`.
- Feel free to refer to image or font files in HTML or CSS using relative path during development. When build, all the assets(`.html`|`.css`|`.js`|`.jpg` etc) are exported under the same level directory without any sub-folders, those path references would be automatically modified.


- - -
Alter `Gruntfiles.js` and customize this workflow to meet your needs. Necessary comments are provided in every tasks' config.