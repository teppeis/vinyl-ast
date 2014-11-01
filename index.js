'use strict';

var util = require('util');
var Vinyl = require('vinyl');
var escodegen = require('escodegen');

function VinylAst(file) {
    Vinyl.call(this, file);

    file = file || {};
    this.ast = file.ast ? file.ast : null;
}
util.inherits(VinylAst, Vinyl);

var vinylContents = Object.getOwnPropertyDescriptor(Vinyl.prototype, 'contents');
Object.defineProperty(VinylAst.prototype, 'contents', {
    get: function() {
        var current = vinylContents.get();
        if (!current && this.ast) {
            this.contents = new Buffer(escodegen.generate(this.ast));
            return vinylContents.get();
        }
        return current;
    },
    set: function(val) {
        vinylContents.set(val);
        this.ast = null;
    }
});

module.exports = VinylAst;
