vinyl-ast
====

> Parse-once and generate-once AST tool bridge for Gulp plugins.

Inspired by [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps).
Just PoC now.

## Usage

Just use Gulp and the plugins.

```javascript
var gulp = require('gulp');
var plugin1usingVinylAst = require('gulp-plugin1-using-vinyl-ast');
var plugin2usingVinylAst = require('gulp-plugin2-using-vinyl-ast');
var plugin3 = require('gulp-plugin3');

gulp.task('javascript', function() {
  gulp.src('src/**/*.js')
    .pipe(plugin1usingVinylAst())
    .pipe(plugin2usingVinylAst())
    .pipe(plugin3())
    .pipe(gulp.dest('dist'));
});
```

Because plugin1 and plugin2 support vinyl-ast,  
The source is parsed once and generated once internally.

Even if plugin3 doesn't know about vinyl-ast, no problem.  
vinyl-ast generate sources as a `file#contents` property for normal gulp plugins.

## VS.

[aster](http://asterjs.github.io/aster/) is an AST-based code builder.  
To use it with Gulp, additional confugiration is needed.

vinyl-ast is primary designed for working with Gulp.  
Gulp users don't have to concern about such an AST.  
Only plugin developers need to do.

## For Gulp plugin developer

Check `file.ast` property, use it and set your result ast to it.

```javascript
var through = require('through2');
var vinylAst = require('vinyl-ast');
var myTransform = require('myTransform');

module.exports = function(options) {

  function transform(file, encoding, callback) {
    var resutl;

    if (file.ast) {
      // use parsed ast!
      result = myTransformFromAst(file.ast, options);
    } else {
      // convert normal vinyl file to VinylAst
      file = VinylAst.from(file);
      // do normal plugin logic
      result = myTransformFromSource(file.contents, options);
    }

    // set result AST to file.ast
    file.ast = result.ast

    this.push(file);
    callback();
  }

  return through.obj(transform);
};
```

## Features

### Select AST parser

TBD

### Specify generator options

TBD

### Sourcemap

Use [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps).

TBD

## License

MIT License: Teppei Sato <teppeis@gmail.com>
