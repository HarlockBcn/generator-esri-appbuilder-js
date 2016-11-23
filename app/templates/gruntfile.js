var onChange = grunt.util._.debounce(function (changedFiles) {
  // grunt.log.writeln("Changed files: " + JSON.stringify(changedFiles));
  grunt.config('ts.main.src', Object.keys(changedFiles.ts).concat([
    'type-declarations/index.d.ts',
    'typings/index.d.ts'
  ]));

  grunt.config('babel.main.files.0.src', Object.keys(changedFiles.js0));
  grunt.config('babel.main.files.1..src', Object.keys(changedFiles.js1));
  grunt.config('copy.main.src', Object.keys(changedFiles.other));
  grunt.config('sync.main.files.0.src', Object.keys(changedFiles.all));
  grunt.config('sync.main.files.1.src', Object.keys(changedFiles.all));


}, 200);
grunt.event.on('watch', function (action, filepath) {
  // grunt.log.writeln("on watch, action=" + action + ", filepath=" + filepath);
  var changedFiles = {
    ts: Object.create(null),
    js0: Object.create(null),
    js1: Object.create(null),
    other: Object.create(null),
    all: Object.create(null)
  };

  if (filepath.endsWith('.ts')) {
    changedFiles.ts[filepath] = action;
  } else if (filepath.endsWith('.js')) {
    if (filepath.startsWith('ts-build')) {
      changedFiles.js1[filepath] = action;
    } else {
      changedFiles.js0[filepath] = action;
    }
  } else {
    changedFiles.other[filepath] = action;
  }
  changedFiles.all[filepath] = action;
  onChange(changedFiles);
});
