"use strict";

const path = require('path');

module.exports = function (grunt) {

    /**
     * Display the elapsed execution time of grunt tasks
     * https://www.npmjs.com/package/time-grunt
     */
    require('time-grunt')(grunt);

    /**
     * Automatically search for the plugin from the task name.
     * Search in the following order:
     *   1. node_modules/grunt-contrib-task-name
     *   2. node_modules/grunt-task-name
     *   3. node_modules/task-name
     *
     * https://www.npmjs.com/package/jit-grunt
     *
     * ATTENTION:
     * 'load-grunt-tasks' is more robust, use that instead, see below
     */
    // require('jit-grunt')(grunt, {});

    /**
     * Load multiple grunt tasks using globing patterns
     * https://www.npmjs.com/package/load-grunt-tasks
     */
    require('load-grunt-tasks')(grunt, {});


    let config = {
        srcPath: 'src',
        distPath: 'dist',
        sourceMap: true, /* for SASS and Babel, set to false when in prod env */
    };

    grunt.initConfig({
        /**
         * some reusable parameters,
         * can be referred as <%= paraName %> in the string parsed by grunt.
         *
         * I reckon using ES6 String Template feature is more practical right now.
         * see above object 'config'.
         */
        // config: {
        //     paraName: 'paraValue'
        // },

        /**
         * Import html partials.
         * https://www.npmjs.com/package/grunt-html-imports
         */
        html_imports: {
            all: {
                expand: true,
                cwd: `${config.srcPath}/pages`,
                src: '**/*',
                dest: `${config.distPath}/`,
                flatten: true,
            }
        },

        /**
         * Compile Sass to CSS
         * https://www.npmjs.com/package/grunt-sass
         */
        sass: {
            options: {
                // https://github.com/sass/node-sass#options
                implementation: require('node-sass'),
                sourceMap: config.sourceMap,
            },
            all: {
                expand: true,
                cwd: `${config.srcPath}`,
                src: '**/*.{scss,sass}',
                dest: `${config.distPath}/`,
                ext: '.css',
                flatten: true,
            }
        },

        /**
         * For Babel 7.x and grunt-babel v8
         * > npm i -D grunt-babel @babel/core @babel/preset-env
         *
         * no .babelrc needed.
         *
         * https://www.npmjs.com/package/grunt-babel
         */
        babel: {
            options: {
                // https://babeljs.io/docs/en/options
                presets: ['@babel/preset-env'],
                sourceMap: config.sourceMap
            },
            all: {
                expand: true,
                cwd: `${config.srcPath}`,
                src: '**/*.js',
                dest: `${config.distPath}/`,
                flatten: true,
            }
        },

        /**
         * This plugin is designed for prepending a CDN url to asset reference,
         * but it also provide an option to customize the way processing those urls.
         *
         * Here, only assets' filename is kept in the url reference,
         * as all the assets are exported in the same level directory.
         *
         * https://www.npmjs.com/package/grunt-cdnify
         */
        cdnify: {
            options: {
                rewriter: url => {
                    let filename = path.basename(url);
                    if (filename.endsWith('.scss') || filename.endsWith('.sass')) {
                        filename = filename.slice(0, -4) + 'css';
                    }
                    return filename;
                },
            },
            html: {
                expand: true,
                cwd: `${config.distPath}/`,
                src: '**/*.html',
                dest: `${config.distPath}/`,
            },
            css: {
                expand: true,
                cwd: `${config.distPath}/`,
                src: '**/*.css',
                dest: `${config.distPath}/`,
            }
        },

        /**
         * Remove files and folders.
         * https://www.npmjs.com/package/grunt-contrib-clean
         */
        clean: {
            dist: {
                src: `${config.distPath}/`
            }
        },

        /**
         * Usually used to copy needed files to destination directory (build outputs)
         * https://www.npmjs.com/package/grunt-contrib-copy
         *
         * todo: specify whatever asset you need to be copied to the exported folder.
         */
        copy: {
            jsLib: {
                expand: true,
                src: [
                    // path.join(__dirname, 'node_modules/es5-shim/es5-shim.min.js')
                    'node_modules/es5-shim/es5-shim.min.js',
                    'node_modules/jquery/dist/jquery.min.js',
                ],
                dest: `${config.distPath}/`,
                flatten: true,
            },
            media: {
                expand: true,
                cwd: `${config.srcPath}`,
                src: '**/*.{jpg,jpeg,png,gif,svg,mp3,mp4}',
                dest: `${config.distPath}/`,
                flatten: true,
            }
        },

        /**
         * Run predefined tasks whenever watched file patterns are added, changed or deleted
         * https://www.npmjs.com/package/grunt-contrib-watch
         *
         * In the following config,
         * only performs corresponding task(s) when a specific type of file is changed,
         * rather than do the whole build task all over again, which is time-consuming and unnecessary.
         */
        watch: {
            options: {
                spawn: false,    // false: speed up the reaction time of the watch, but can make the watch more prone to failing so please use as needed.
                interrupt: true, // terminate previous process if new file-change event fired.
                interval: 100,   // passed to fs.watchFile, default is 100ms.
                reload: true,    // true: changes to any of the watched files will trigger the watch task to restart.
                atBegin: false,  // trigger the run of each specified task at startup of the watcher.
            },
            html: {
                files: `${config.srcPath}/**/*.html`,
                tasks: ['html_imports', 'cdnify:html'],
            },
            sass: {
                files: `${config.srcPath}/**/*.{scss,sass}`,
                tasks: ['sass', 'cdnify:css'],
            },
            babel: {
                files: `${config.srcPath}/**/*.js`,
                tasks: ['babel'],
            }
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'html_imports',
        'sass',
        'babel',
        'cdnify',
    ]);

    grunt.registerTask('test', 'test tasks functioning', [
        'clean',
        'sass'
    ]);

    grunt.registerTask('default', 'start dev server', [
        'build',
        'watch',
    ]);
};