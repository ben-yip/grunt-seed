# Problem
- There is a known issue of the official grunt plugin [`grunt-contrib-watch`](https://www.npmjs.com/package/grunt-contrib-watch) which can be described in short:     
  > New files in empty folder are not watched.
- This problem was first found in 2013, but not yet solved until now (2018-10).    
  It probably comes from its dependency [gaze](https://www.npmjs.com/package/gaze).
- See discussions in related issues:
    - [issue #166](https://github.com/gruntjs/grunt-contrib-watch/issues/166)
    - [issue #282](https://github.com/gruntjs/grunt-contrib-watch/issues/282)
    - [issue #405](https://github.com/gruntjs/grunt-contrib-watch/issues/405)
    - [issue #436](https://github.com/gruntjs/grunt-contrib-watch/issues/436)
    - and [many more...](https://github.com/gruntjs/grunt-contrib-watch/issues?utf8=✓&q=new+added)
    

# Solution
- [`grunt-chokidar`](https://github.com/JimmyRobz/grunt-chokidar) is a fork of `grunt-contrib-watch`. It only changes the "watch" behavior utilizing [chokidar](https://www.npmjs.com/package/chokidar) rather than gaze, and maintain other functionality.
- If you are familiar with `grunt-contrib-watch`, then it should be painless to switch to `grunt-chokidar`.
- Install: `npm install -D grunt-chokidar`
- NPM repo: https://www.npmjs.com/package/grunt-chokidar
