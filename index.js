'use strict';

var util = require('util');
var Vinyl = require('vinyl');
var escodegen = require('escodegen');

/**
 * @param file {Object}
 * @constructor
 * @extends {Vinyl}
 */
function VinylAst(file) {
    Vinyl.call(this, file);

    file = file || {};
    this._ast = file.ast ? file.ast : null;
    this.astSource = file.astSource ? file.astSource : null;
}
util.inherits(VinylAst, Vinyl);

/**
 * @param vinyl {Vinyl} original vinyl file
 * @param vinyl {Vinyl} original vinyl file
 * @param opt_ast {Object=} parsed ast
 * @return {VinylAst}
 */
VinylAst.from = function(vinyl, opt_ast) {
    var file = new VinylAst({
        cwd: vinyl.cwd,
        base: vinyl.base,
        // TODO: cloneStat?
        stat: vinyl.stat,
        history: vinyl.history.slice(),
        contents: vinyl.contents
    });
    if (opt_ast) {
        file.ast = opt_ast;
    }
    return file;
};

var vinylContents = Object.getOwnPropertyDescriptor(Vinyl.prototype, 'contents');

// #ast overwrite #astSource and #contents
Object.defineProperty(VinylAst.prototype, 'ast', {
    get: function() {
        return this._ast;
    },
    set: function(val) {
        this._ast = val;
        this.astSource = null;
        vinylContents.set.call(this, null);
    }
});

// #contents overwrite #ast and #astSource
Object.defineProperty(VinylAst.prototype, 'contents', {
    get: function() {
        var current = vinylContents.get.call(this);
        if (!current && this.ast) {
            if (this.astSource) {
                this.contents = new Buffer(this.astSource);
            } else {
                this.contents = new Buffer(escodegen.generate(this.ast));
            }
            return vinylContents.get.call(this);
        }
        return current;
    },
    set: function(val) {
        vinylContents.set.call(this, val);
        this._ast = null;
        this.astSource = null;
    }
});

module.exports = VinylAst;
