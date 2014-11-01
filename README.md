vinyl-ast
====

> Parse-once and generate-once AST tool bridge for Gulp plugins.

Inspired by [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps).
Just PoC now.

## Usage

Just use Gulp and the plugins.

```javascript
var gulp = require('gulp');
var plugin1 = require('gulp-plugin1');
var plugin2 = require('gulp-plugin2');
var plugin3 = require('gulp-plugin3');

gulp.task('javascript', function() {
  gulp.src('src/**/*.js')
    .pipe(plugin1())
    .pipe(plugin2())
    .pipe(plugin3())
    .pipe(gulp.dest('dist'));
});
```

If plugin1 and plugin2 support vinyl-ast,
The source is parsed once and generated once internally.

Even if plugin3 doesn't know such a vinyl-ast, no problem.
vinyl-ast generate sources as a `file#contents` property for normal gulp plugins.

## VS.

[aster](http://asterjs.github.io/aster/) is an AST-based code builder.
To use it with Gulp, additional confugiration is needed.

vinyl-ast is designed for working with Gulp.
Users don't have to concerned about such a AST.
Only plugin developers need to do.

## For Gulp plugin developer

```javascript
var through = require('through2');
var vinylAst = require('vinyl-ast');
var myTransform = require('myTransform');

module.exports = function(options) {

  function transform(file, encoding, callback) {
    // convert normal vinyl file to VinylAst
    if (!file.ast) {
      file = VinylAst.from(file);
    }

    // do normal plugin logic
    var result = myTransform(file.contents, options);
    // set result AST to #ast
    file.ast = result.ast

    this.push(file);
    callback();
  }

  return through.obj(transform);
};
```

## Featurs

### Select AST parser

TBD

### Specify generator options

TBD

### Sourcemap

Use [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps).

TBD

## License

MIT License: Teppei Sato <teppeis@gmail.com>
