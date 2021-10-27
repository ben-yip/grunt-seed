"use strict";

const path = require('path');

module.exports = function (grunt) {

  /**
   * Display the elapsed execution time of grunt tasks.
   *
   * The watch task and tasks that take less than 1% of the total time are hidden to reduce clutter.
   * Run grunt with grunt --verbose to see all tasks.
   *
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
    destPath: 'dist',
    sourceMap: true, /* for SASS and Babel, set to false when in prod env */
    organizePath: {
      asset: 'asset', // used for the parent dir for all assets
      styles: 'styles',
      scripts: 'scripts',
      images: 'images',
      fonts: 'fonts',
      media: 'media'
    },
  };

  let destAssetPath = path.join(config.destPath, config.organizePath.asset);

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
        cwd: `${config.srcPath}`,
        src: ['**/*.html', '**/*.htm'],
        dest: `${config.destPath}`,
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
        dest: `${config.destPath}`,
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
        src: ['**/*.js', '!**/*.min.js'],
        dest: `${config.destPath}`,
        flatten: true,
      }
    },

    /**
     * Minify HTML
     *
     * https://www.npmjs.com/package/grunt-contrib-htmlmin
     * https://github.com/kangax/html-minifier#options-quick-reference
     */
    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true
      },
      dist: {
        files: [{
          expand: true,
          cwd: `${config.destPath}`,
          src: ['*.html', '*.htm',],
          dest: `${config.destPath}`,
        }]
      }
    },

    /**
     * Minify CSS
     * https://www.npmjs.com/package/grunt-contrib-cssmin
     *
     * For finer-grained control, see:
     * https://github.com/jakubpawlowicz/clean-css#constructor-options
     */
    cssmin: {
      options: {
        sourceMap: config.sourceMap,
        compatibility: 'ie8',
      },
      dist: {
        files: [{
          expand: true,
          cwd: `${config.destPath}`,
          src: ['*.css', '!*.min.css'],
          dest: `${config.destPath}`,
          ext: '.min.css'
        }]
      }
    },

    /**
     * Minify JavaScript files with UglifyJS
     * https://www.npmjs.com/package/grunt-contrib-uglify
     */
    uglify: {
      options: {
        sourceMap: config.sourceMap,
        ie8: true,
      },
      dist: {
        files: [{
          expand: true,
          cwd: `${config.destPath}`,
          src: ['*.js', '!*.min.js'],
          extDot: 'last',
          dest: `${config.destPath}`,
          ext: '.min.js'
        }]
      }
    },

    /**
     * Minify images using imagemin
     * https://www.npmjs.com/package/grunt-contrib-imagemin
     */
    imagemin: {
      options: {
        optimizationLevel: 3, // [PNG] 0~7, defaults 3
        progressive: true,    // [JPG] Lossless conversion to progressive. defaults true
        interlaced: true,     // [GIF] Interlace gif for progressive rendering. defaults true
      },
      dist: {
        expand: true,
        cwd: `${config.destPath}`,
        src: ['*.{jpg,jpeg,png,gif,svg}'],
        dest: `${config.destPath}`
      }
    },

    /**
     * This plugin is designed for prepending a CDN url to asset reference,
     * but it also provide an option to customize the way processing those urls.
     * https://www.npmjs.com/package/grunt-cdnify
     *
     * Default applies to:
     *   {
     *     'img[data-src]': 'src',
     *     'img[src]': 'src',
     *     'link[rel="]': 'href',
     *     'link[rel="shortcut icon"]': 'href',
     *     'link[rel=icon]': 'href',
     *     'link[rel=stylesheet]': 'href',
     *     'script[src]': 'src',
     *     'source[src]': 'src',
     *     'video[poster]': 'poster'
     *   }
     * You can add more rules to it,
     * or explicitly override any default rule you don't want with false.
     * https://www.npmjs.com/package/grunt-cdnify#html-booleanobject
     */
    cdnify: {
      options: {
        /**
         * parse <a> as well,
         * then you can refer to another .html in relative path during development.
         */
        html: {
          'a[href]': 'href',
          'video[src]': 'src',
        },
        /**
         * Only assets' filename is kept in the url reference,
         * as all the assets are exported in the same level directory.
         */
        rewriter: url => {
          // leave data URIs untouched
          if (url.indexOf('data:') === 0) {
            return url;
          }
          // leave http URLs untouched
          if (/^https?:/.test(url)) {
            return url;
          }

          let filename = path.basename(url);
          if (filename.endsWith('.scss') || filename.endsWith('.sass')) {
            filename = filename.slice(0, -4) + 'css';
          }
          return filename;
        },
      },
      html: {
        expand: true,
        cwd: `${config.destPath}/`,
        src: ['**/*.html', '**/*.htm'],
        dest: `${config.destPath}/`,
      },
      css: {
        expand: true,
        cwd: `${config.destPath}/`,
        src: '**/*.css',
        dest: `${config.destPath}/`,
      },

      /**
       * After cssmin and uglify optimization,
       * alter HTMl's .css|.js asset reference url to .min.css|.min.js
       */
      min: {
        options: {
          rewriter: url => {
            // leave data URIs untouched
            if (url.indexOf('data:') === 0) {
              return url;
            }
            // leave http URLs untouched
            if (/^https?:/.test(url)) {
              return url;
            }

            let filename = path.basename(url);
            if (filename.endsWith('.css') && !filename.endsWith('.min.css')) {
              filename = filename.slice(0, -3) + 'min.css';
            }
            if (filename.endsWith('.js') && !filename.endsWith('.min.js')) {
              filename = filename.slice(0, -2) + 'min.js';
            }
            return filename;
          },
        },
        expand: true,
        cwd: `${config.destPath}/`,
        src: ['**/*.html', '**/*.htm'],
        dest: `${config.destPath}/`,
      },

      /**
       * Before moving different types of asset to according sub directories,
       *   alter the url references in .html or .css
       *
       * todo: how to tell if a .svg is used for font or image?
       *       As it's uncommon to use SVG for images, I would place all .svg under fonts dir
       */
      organize_html: {
        options: {
          rewriter: url => {
            // leave data URIs untouched
            if (url.indexOf('data:') === 0) {
              return url;
            }
            // leave http URLs untouched
            if (/^https?:/.test(url)) {
              return url;
            }

            let filename = path.basename(url);
            let subPath = '';

            if (/\.css$/g.test(filename)) {
              subPath = `${config.organizePath.styles}/${filename}`;
            } else if (/\.js$/g.test(filename)) {
              subPath = `${config.organizePath.scripts}/${filename}`;
            } else if (/\.(jpg|jpeg|png|gif|ico)$/g.test(filename)) {
              subPath = `${config.organizePath.images}/${filename}`;
            } else if (/\.(eot|svg|ttf|woff|woff2)$/g.test(filename)) {
              subPath = `${config.organizePath.fonts}/${filename}`;
            } else if (/\.(mp3|mp4|swf)$/g.test(filename)) {
              subPath = `${config.organizePath.media}/${filename}`;
            } else {
              return url;
            }

            // console.log(path.join(config.organizePath.asset, subPath));
            return `${config.organizePath.asset}/${subPath}`;
          }
        },
        expand: true,
        cwd: `${config.destPath}/`,
        src: ['**/*.html', '**/*.htm'],
        dest: `${config.destPath}/`,
      },

      organize_css: {
        options: {
          rewriter: url => {
            // leave data URIs untouched
            if (url.indexOf('data:') === 0) {
              return url;
            }
            // leave http URLs untouched
            if (/^https?:/.test(url)) {
              return url;
            }

            let filename = path.basename(url);
            let subPath = '';

            if (/\.(jpg|jpeg|png|gif|ico)$/g.test(filename)) {
              subPath = `${config.organizePath.images}/${filename}`;
            }
            /**
             * in bootstrap-icons stylesheet, its font resource url contains trailing version mark,
             * e.g. url("./fonts/bootstrap-icons.woff2?856008caa5eb66df68595e734e59580d")
             * thus here do NOT use the $ to testify any font file extension.
             */
            else if (/\.(eot|svg|ttf|woff|woff2)/g.test(filename)) {
              subPath = `${config.organizePath.fonts}/${filename}`;
            } else {
              return url;
            }

            // console.log(path.join('..', subPath));
            return `../${subPath}`;
          }
        },
        expand: true,
        cwd: `${config.destPath}/`,
        src: '**/*.css',
        dest: `${config.destPath}/`,
      },
    },

    /**
     * Remove files and folders.
     * https://www.npmjs.com/package/grunt-contrib-clean
     */
    clean: {
      dist: {
        src: `${config.destPath}/`
      },
      nonmin: {
        expand: true,
        cwd: `${config.destPath}`,
        src: [
          '*.css', '!*.min.css', '*.css.map',
          '*.js', '!*.min.js', '*.js.map',
        ]
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
          /* no need to use absolute path */
          // path.join(__dirname, 'node_modules/es5-shim/es5-shim.min.js')
          'node_modules/es5-shim/es5-shim.min.js',
          'node_modules/jquery/dist/jquery.min.js',
          // 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
        ],
        dest: `${config.destPath}/`,
        flatten: true,
      },
      /**
       * Bootstrap Icons.
       * https://icons.getbootstrap.com/
       *
       * In addition, import bootstrap-icon.css in your own scss file.
       */
      bs_icons: {
        expand: true,
        src: [
          // 'node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff',
          // 'node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2',
        ],
        dest: `${config.destPath}/`,
        flatten: true,
      },

      /**
       * IE5/6/7/8 CSS support, uncomment this if needed.
       * https://github.com/ben-yip/ie7js
       *
       * REMEMBER to add this to your HTML
       *    <!--[if lt IE 9]>
       *    <script type="text/javascript" src="IE9.min.js"></script>
       *    <![endif]-->
       */
      // ie7js: {
      //     expand: true,
      //     dest: `${config.destPath}/`,
      //     flatten: true,
      //     src: [
      //         'node_modules/ie7js/dist/IE9.min.js',
      //         'node_modules/ie7js/dist/blank.gif'
      //     ]
      // },
      /**
       * slick-carousel assets, uncomment this if needed.
       * https://github.com/kenwheeler/slick/
       * http://kenwheeler.github.io/slick/
       *
       * REMEMBER to @import slick.scss and slick-theme.scss in your on scss files.
       */
      // slick_carousel: {
      //     expand: true,
      //     cwd: 'node_modules/slick-carousel/slick/',
      //     src: [
      //         'slick.min.js',
      //         'fonts/*.*',
      //         'ajax-loader.gif',
      //     ],
      //     dest: `${config.destPath}/`,
      //     flatten: true,
      // },

      media: {
        expand: true,
        cwd: `${config.srcPath}`,
        src: '**/*.{jpg,jpeg,png,gif,svg,ico,mp3,mp4,htc}',
        dest: `${config.destPath}/`,
        flatten: true,
      }
    },

    /**
     *
     * At final build stage, move asset files organizing to different sub folders.
     * https://www.npmjs.com/package/grunt-move
     */
    move: {
      options: {
        ignoreMissing: true,
      },
      organize: {
        files: [
          {
            expand: true, /* necessary */
            flatten: true,
            src: `${config.destPath}/**/*.css`,
            dest: path.join(destAssetPath, config.organizePath.styles),
          },
          {
            expand: true,
            flatten: true,
            src: `${config.destPath}/**/*.js`,
            dest: path.join(destAssetPath, config.organizePath.scripts),
          },
          {
            expand: true,
            flatten: true,
            src: `${config.destPath}/**/*.{jpg,jpeg,png,gif,ico}`,
            dest: path.join(destAssetPath, config.organizePath.images),
          },
          {
            expand: true,
            flatten: true,
            src: `${config.destPath}/**/*.{eot,svg,ttf,woff,woff2}`,
            dest: path.join(destAssetPath, config.organizePath.fonts),
          },
          {
            expand: true,
            flatten: true,
            src: `${config.destPath}/**/*.{mp3,mp4,swf}`,
            dest: path.join(destAssetPath, config.organizePath.media),
          },
        ]
      }
    },

    /**
     * Run predefined tasks whenever watched file patterns are added, changed or deleted using chokidar.
     * https://www.npmjs.com/package/grunt-chokidar
     *
     * Options:
     * (below are default values)
     *   spawn: true,      | false: speed up the reaction time of the watch, but can make the watch more prone to failing.
     *   interrupt: false, | true: terminate previous process if new file-change event fired.
     *   interval: 100,    | time(ms) passed to fs.watchFile.
     *   reload: false,    | true: changes to any of the watched files will trigger the watch task to restart.
     *   atBegin: false,   | trigger the run of each specified task at startup of the watcher.
     *   event: 'all',     | can be 'all', 'change', 'add', 'addDir', 'unlink' and 'unlinkDir' define in an array.
     *
     * In the following config,
     * only performs corresponding task(s) when a specific type of file is changed,
     * rather than do the whole build task all over again, which is time-consuming and unnecessary.
     */
    chokidar: {
      options: {
        spawn: false,
        interrupt: true,
        reload: true,
      },
      html: {
        files: `${config.srcPath}/**/*.{html,htm}`,
        tasks: ['html_imports', 'cdnify:html'],
      },
      sass: {
        files: `${config.srcPath}/**/*.{scss,sass}`,
        tasks: ['sass', 'cdnify:css'],
      },
      babel: {
        files: `${config.srcPath}/**/*.js`,
        tasks: ['babel'],
      },
      newMedia: {
        files: `${config.srcPath}/**/*.{jpg,jpeg,png,gif,svg,mp3,mp4,htc}`,
        tasks: ['copy:media'],
      }
    },

    /**
     * Use browserSync as the hot dev server.
     *
     * https://www.npmjs.com/package/grunt-browser-sync
     * https://www.browsersync.io/docs/grunt#grunt-watch
     */
    browserSync: {
      dev: {
        options: {
          /* https://www.browsersync.io/docs/options */
          server: `${config.destPath}`,
          port: 8000,
          ui: {port: 8001},
          open: true,
          notify: false,

          watchTask: true, // be sure to call the watch task AFTER browserSync
        },
        bsFiles: {
          src: [`${config.destPath}/*`]  // watches all the files under dist.
        },
      }
    },

    /**
     * Run grunt tasks concurrently to improve the build time
     * https://www.npmjs.com/package/grunt-concurrent
     */
    concurrent: {
      /*
       * HTML|SASS|Babel compile process can be done separately at the same time.
       * While there are not so many files to handle at the beginning,
       * the concurrent tasks' loading time would take up a larger part of the whole build time,
       * therefore you may uncomment the concurrent task config later as the development goes on.
       */
      compile: [
        'html_imports',
        'sass',
        'babel',
      ],
      /*
       * same issue as above,
       * each child process task's loading time normally cost several hundred ms,
       * if the task itself actually costs less time than the loading stage,
       * then no need to run concurrently wasting time loading each task.
       */
      min: [
        'htmlmin',
        'cssmin',
        'uglify',
        'imagemin',
      ]
    },

    /**
     * Buddha shines, no bugs alive.
     * https://www.npmjs.com/package/grunt-buddha-bless
     */
    buddha: {
      bless_me: `${config.destPath}/*.js`
    }
  });

  grunt.registerTask('compile', 'compile HTML, Sass and Babel', [
    'clean:dist',
    'copy',

    'html_imports',
    'sass',
    'babel',
    // 'concurrent:compile',  /*May even slow down since loading tasks separately costs extra time.*/

    'cdnify:html',
    'cdnify:css',
  ]);

  grunt.registerTask('min', 'do the optimization work', [
    'htmlmin', /* optional */
    'cssmin',
    'uglify',
    'imagemin',
    // 'concurrent:min',  /*Same reason as above.*/

    'cdnify:min',
    'clean:nonmin',
  ]);

  grunt.registerTask('organize', 'put different asset to corresponding sub folder.', [
    'cdnify:organize_html',
    'cdnify:organize_css',
    'move:organize',
  ]);

  grunt.registerTask('build', 'build all the src and optimize assets', [
    'compile',
    'min', /* optional, works fine without optimizing work */
    'buddha', /* optional */
    'organize' /* optional */
  ]);

  grunt.registerTask('start', 'start dev server', [
    'compile',
    'browserSync',
    'chokidar',
  ]);

  grunt.registerTask('default', 'alias of "start" task.', 'start');
  grunt.registerTask('watch', 'alias for "chokidar" task.', 'chokidar');

  grunt.registerTask('test', 'test tasks functioning', [
    'clean:dist',
    'chokidar'
  ]);
};
