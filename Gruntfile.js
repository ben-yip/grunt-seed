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
        // assetPath: 'asset',
        distPath: 'dist',
        sourceMap: true,  /* for SASS and Babel, set to false when in prod env */
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
                cwd: 'src/pages',
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
                implementation: require('node-sass'),
                sourceMap: config.sourceMap,
            },
            all: {
                expand: true,
                cwd: `src/`,
                src: '**/*.scss',
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
                presets: ['@babel/preset-env'],
                sourceMap: config.sourceMap
            },
            all: {
                expand: true,
                cwd: `src/`,
                src: '**/*.js',
                dest: `${config.distPath}/`,
                flatten: true,
            }
        },

        // ====================

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
            }
        }
    });


    grunt.registerTask('build', [
        'clean:dist',
        'copy',
        'html_imports',
        'sass',
        'babel',
    ]);

    grunt.registerTask('test', 'test tasks functioning', [
        'clean',
        'babel'
    ]);

    grunt.registerTask('default', 'start dev server', '');

    /**
     * todo
     * watch时，哪个类型的文件有变动，就只执行该类型文件的重新编译
     * 不要全部类型的文件都重新编译
     */
};