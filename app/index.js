'use strict';
var path = require('path');
var Base = require('yeoman-generator').Base;
var yosay = require('yosay');
var chalk = require('chalk');
var isWin = process.platform === 'win32';
var homedir = (isWin) ? process.env.HOMEPATH : process.env.HOME;
var fs = require('fs');
var mkdirp = require('mkdirp');

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

module.exports = Base.extend({
  initializing: function() {
    // check for existence of package.json
    try {
      fs.accessSync('./package.json', fs.F_OK);
      this.hasPackageJson = true;
    } catch (e) {
      this.hasPackageJson = false;
    }
  },

  prompting: function() {
    var done = this.async();
    var self = this;

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the ArcGIS Web AppBuilder generator!'));
    this.log(chalk.yellow('These generators should be run in the root folder of your project.'));

    var prompts = [{
      name: 'abort',
      type: 'confirm',
      default: true,
      message: 'No package.json found. Would you like to abort and run npm init first?',
      when: function() {
        return !self.hasPackageJson;
      }
    }, {
      type: 'list',
      choices: [
        {
        value: 'is2d',
        name: '2D'
        },
        {
        value: 'is3d',
        name: '3D'
        }
      ],
      name: 'widgetsType',
      message: 'Type of widget(s) to be generated:',
      when: function(currentAnswers) {
        return !currentAnswers.abort;
      }
    }, {
      when: function(currentAnswers) {
        return !currentAnswers.abort;
      },
      name: 'wabRoot',
      message: 'Web AppBuilder install root:',
      'default': function(currentAnswers) {
        var wabDir;
        if (currentAnswers.widgetsType === 'is3d') {
          wabDir = path.join(homedir, 'WebAppBuilderForArcGIS');
        } else {
          wabDir = path.join(homedir, 'WebAppBuilderForArcGIS');
        }
        return wabDir;
      },
      validate: function(wabPath) {
        // make sure input directory and the following paths exist:
        // * server
        // * client
        var paths = [wabPath, path.join(wabPath, 'server'), path.join(wabPath, 'client')];
        try {
          paths.forEach(function(path) {
            fs.accessSync(path, fs.F_OK);
          });
          return true;
        } catch (e) {
          // It isn't accessible
          return 'Invalid path. Please ensure this is a valid path to your WAB root.';
        }
      }
    }, {
      when: function(currentAnswers) {
        if (currentAnswers.abort) {
          return false;
        }
        try {
          var appsPath = path.join(currentAnswers.wabRoot, 'server', 'apps');
          var appsDirectories = getDirectories(appsPath);
          if (appsDirectories.length > 0) {
            return true;
          } else {
            this.log(chalk.red('You do not have any WAB apps setup yet. After you create an app, please see the Gruntfile for a todo, or run this generator again.'));
          }
        } catch (e) {
          this.log(chalk.red('You do not have any WAB apps setup yet. After you create an app, please see the Gruntfile for a todo, or run this generator again.'));
        }

      }.bind(this),
      name: 'appDirId',
      type: 'list',
      message: 'Web AppBuilder application:',
      choices: function(currentAnswers) {
        // Always include option for "None"
        var retArray = [{
          name: 'None',
          value: 'None',
          short: 'N'
        }];
        var appsPath = path.join(currentAnswers.wabRoot, 'server', 'apps');
        var appsDirectories = getDirectories(appsPath);
        appsDirectories.forEach(function(appDirectory) {
          try {
            // get the config file, convert to JSON, and read the title property
            var configPath = path.join(currentAnswers.wabRoot, 'server', 'apps', appDirectory, 'config.json');
            var configJson = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (configJson.hasOwnProperty('title') && configJson.title !== '') {
              retArray.push({
                name: configJson.title,
                value: appDirectory,
                short: appDirectory
              });
            } else {
              // does not have title property or is empty. Use the app folder name (number) as the name.
              retArray.push({
                name: appDirectory,
                value: appDirectory,
                short: appDirectory
              });
            }
          } catch (e) {
            // Cannot open the config file. Just use the app folder name (number) as the name
            retArray.push({
              name: appDirectory,
              value: appDirectory,
              short: appDirectory
            });
          }
        });
        return retArray;
      }
    }];

    this.prompt(prompts, function(props) {
      this.abort = props.abort;
      this.wabRoot = props.wabRoot;
      this.widgetsType = props.widgetsType;
      if (props.appDirId && props.appDirId !== 'None') {
        this.appDirId = props.appDirId;
      } else {
        this.appDirId = false;
      }
      done();
    }.bind(this));
  },

  writing: {
    app: function() {
      if (this.abort) {
        return;
      }
      mkdirp('libs');
      mkdirp('libs/vendor');
      mkdirp('libs/vendor-amd');
      mkdirp('widgets');
      this.config.set('widgetsType', this.widgetsType);
    },

    gruntConfig: function() {
      if (this.abort) {
        return;
      }

      // Setting up the stemappDir and appDir Gruntfile variables:
      var stemappDir;
      if (this.widgetsType === 'is3d') {
        stemappDir = path.join(this.wabRoot, 'client', 'stemapp3d');
      } else {
        stemappDir = path.join(this.wabRoot, 'client', 'stemapp');
      }
      var appDir = false;
      if (this.appDirId) {
        appDir = path.join(this.wabRoot, 'server', 'apps', this.appDirId);
      }
      if (isWin) {
        // this hack is needed to ensure paths are not escaped when injected into Gruntfile
        stemappDir = stemappDir.replace(/\\/g, '/');
        if (appDir) {
          appDir = appDir.replace(/\\/g, '/');
        }
      }
      this.gruntfile.insertVariable('stemappDir', '"' + stemappDir + '"');
      if (appDir) {
        this.gruntfile.insertVariable('appDir', '"' + appDir + '"');
      } else {
        this.gruntfile.insertVariable('appDir', '"TODO - AFTER CREATING AN APP, PLEASE PUT PATH HERE AND INSERT ENTRY IN SYNC.MAIN.FILES BELOW."');
      }


      // SYNC CONFIG
      var syncConfig = '{ main: { verbose: true, files: [';
      var filesPrefix = '{cwd: \'dist/\', src: \'**\', dest: ';
      syncConfig = syncConfig + filesPrefix + 'stemappDir }';
      if (appDir) {
        syncConfig = syncConfig + ',' + filesPrefix + 'appDir }';
      }
      syncConfig = syncConfig + ']';
      syncConfig = syncConfig + '} }';

      this.gruntfile.insertConfig('sync', syncConfig);

      // BABEL CONFIG
      var babelConfig = {
        main: {
          files: [{
            expand: true,
            src: [
              'libs/**/*.js',
              '!libs/vendor/**/*',
              '!libs/vendor-amd/**/*',
              'widgets/*.js',
              'widgets/**/*.js',
              'widgets/**/**/*.js',
              'widgets/!**/**/nls/*.js',
              'themes/*.js',
              'themes/**/*.js',
              'themes/**/**/*.js',
              'themes/!**/**/nls/*.js'
            ],
            dest: 'dist/'
          },{
              'expand': true,
              'cwd': 'ts-build/',
              'src': [
                '**/**.js'
              ],
              'dest': 'dist/'
          }]
        }
      };
      this.gruntfile.insertConfig('babel', JSON.stringify(babelConfig));

      // TYPESCRIPT CONFIG
      var tsconfigJson = JSON.parse(this.read('tsconfig.json'));

      // This configuration seems to be the only way to use grunt-ts and compile only changed files
      var typescriptConfig = {
        main: {
          //
          tsconfig: false,
          src: tsconfigJson.compilerOptions.files.concat(tsconfigJson.compilerOptions.types),
          outDir: './ts-build',
          options: Object.assign({
            fast: 'never'}, tsconfigJson.compilerOptions)
        }
      };
      this.gruntfile.insertConfig('ts', JSON.stringify(typescriptConfig));

      // WATCH CONFIG
      this.gruntfile.insertConfig('watch', JSON.stringify({
        // Babel will compile ts files compiled to es6
        'main-no-ts': {
          files: [
            'ts-build/**/*.*',
            'libs/**/*.*',
            'widgets/**/*.*',
            'themes/**/*.*',
            '!libs/**/*.ts',
            '!widgets/**/*.ts',
            '!themes/**/*.ts'
          ], tasks: [
            // It's more optimal to execute clean manually when needed
            // and only compile changed files.
            // 'clean',
            'babel',
            'copy',
            'sync'
          ], options: {
            spawn: false,
            atBegin: true
          }
      }, 'main-ts': {
          'files': [
            'libs/**/*.ts',
            'widgets/**/*.ts',
            'themes/**/*.ts'
          ],
          'tasks': [
            'ts'
          ],
          'options': {
            'spawn': false,
            'atBegin': true
          }
      }}));

      // COPY CONFIG
      this.gruntfile.insertConfig('copy', JSON.stringify({
        main: {
          src: [
            'libs/vendor/**/*.*',
            'libs/vendor-amd/**/*.*',
            'libs/**/**.html',
            'libs/**/**.json',
            'libs/**/**.css',
            'libs/**/images/**',
            'libs/**/nls/**',
            '!libs/vendor/**/**.html',
            '!libs/vendor/**/**.json',
            '!libs/vendor/**/**.css',
            '!libs/vendor/**/images/**',
            '!libs/vendor/**/nls/**',
            '!libs/vendor-amd/**/**.html',
            '!libs/vendor-amd/**/**.json',
            '!libs/vendor-amd/**/**.css',
            '!libs/vendor-amd/**/images/**',
            '!libs/vendor-amd/**/nls/**',
            'widgets/**/**.html',
            'widgets/**/**.json',
            'widgets/**/**.css',
            'widgets/**/images/**',
            'widgets/**/nls/**',
            'themes/**/**.html',
            'themes/**/**.json',
            'themes/**/**.css',
            'themes/**/images/**',
            'themes/**/nls/**'
          ],
          dest: 'dist/',
          expand: true
        }
      }));

      // CLEAN CONFIG
      this.gruntfile.insertConfig('clean', JSON.stringify({
        dist: {
          src: 'dist/**'
        }
      }));

      // load tasks
      this.gruntfile.loadNpmTasks('grunt-ts');
      this.gruntfile.loadNpmTasks('grunt-babel');
      this.gruntfile.loadNpmTasks('grunt-contrib-clean');
      this.gruntfile.loadNpmTasks('grunt-contrib-copy');
      this.gruntfile.loadNpmTasks('grunt-contrib-watch');
      this.gruntfile.loadNpmTasks('grunt-sync');

      // register tasks
      // Only clean at begin
      this.gruntfile.registerTask('default', ['clean', 'watch']);

      // Add javascript code
      var baseGruntfile = this.read('gruntfile.js');
      this.gruntfile.prependJavaScript(baseGruntfile);

    },

    projectfiles: function() {
      if (this.abort) {
        return;
      }
      this.copy('editorconfig', '.editorconfig');
      this.copy('jshintrc', '.jshintrc');
      this.copy('babelrc', '.babelrc');
      // Typescript support files
      this.copy('tsconfig.json', 'tsconfig.json');
      this.copy('tslint.json', 'tslint.json');
      this.directory('type-declarations', 'type-declarations');
      var arcgisVersion = this.is3D? '4x':'3x';
      var arcgisVersionDel = this.is3D? '3x':'4x';
      this.fs.delete('type-declarations/arcgis-js-api-' + arcgisVersionDel + '.d.ts');
      this.fs.copy('type-declarations/index-' + arcgisVersion + '.d.ts', 'type-declarations/index.d.ts');
      this.fs.delete('type-declarations/index-3x.d.ts');
      this.fs.delete('type-declarations/index-4x.d.ts');
      // libs
      this.directory('libs', 'libs');
    }
  },

  install: function() {
    if (this.abort || this.options['skip-install']) {
      return;
    }
    this.npmInstall([
      'babel-plugin-transform-es2015-modules-simple-amd',
      'babel-preset-es2015-without-strict',
      'babel-preset-stage-0',
      'grunt',
      'grunt-contrib-watch',
      'grunt-sync',
      'grunt-babel',
      'grunt-ts',
      'grunt-contrib-clean',
      'grunt-contrib-copy',
      'typescript@^2.0.3'
    ], {
      'saveDev': true
    });
  }
});
