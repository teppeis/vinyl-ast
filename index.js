'use strict';

var Vinyl = require('vinyl');
var escodegen = require('escodegen');

// Original getter/setter of #contents
var vinylContents = Object.getOwnPropertyDescriptor(Vinyl.prototype, 'contents');

/**
 * @param {Vinyl} vinyl Original vinyl file
 */
function vinylAstApply(vinyl) {
    // TODO: cache for isBuffer() or isStream()
    // #ast
    Object.defineProperty(vinyl, 'ast', {
        get: function() {
            return this._ast;
        },
        set: function(val) {
            this._ast = val;
            vinylContents.set.call(this, null);
        }
    });

    // #contents
    Object.defineProperty(vinyl, 'contents', {
        get: function() {
            var current = vinylContents.get.call(this);
            if (!current && this.ast) {
                current = new Buffer(escodegen.generate(this.ast));
            }
            return current;
        },
        set: function(val) {
            vinylContents.set.call(this, val);
            this._ast = null;
        }
    });

    vinyl._ast = null;
}

module.exports = {
    apply: vinylAstApply
};
