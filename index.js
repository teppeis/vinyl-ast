'use strict';

var Vinyl = require('vinyl');
var escodegen = require('escodegen');

// Original getter/setter methods of #contents
var vinylContents = Object.getOwnPropertyDescriptor(Vinyl.prototype, 'contents');
// Original clone method
var vinylClone = Vinyl.prototype.clone;

/**
 * @param {Vinyl} vinyl Original vinyl file
 */
function vinylAstApply(vinyl) {
    if (Object.getOwnPropertyDescriptor(vinyl, 'ast')) {
        // already applied
        return vinyl;
    }

    // #ast
    Object.defineProperty(vinyl, 'ast', {
        get: function() {
            return this._ast;
        },
        set: function(val) {
            this._ast = val;
            this._astSourceBuffer = null;
            vinylContents.set.call(this, null);
        }
    });

    // #contents
    Object.defineProperty(vinyl, 'contents', {
        get: function() {
            var current = vinylContents.get.call(this);
            if (!current && this.ast) {
                if (!this._astSourceBuffer) {
                    this._astSourceBuffer = new Buffer(escodegen.generate(this.ast));
                }
                current = this._astSourceBuffer;
            }
            return current;
        },
        set: function(val) {
            vinylContents.set.call(this, val);
            this._ast = null;
        }
    });

    vinyl.clone = function(opt) {
        var cloned = vinylClone.call(this, opt);
        vinylAstApply(cloned);
        return cloned;
    };

    vinyl._ast = vinyl._ast || null;
}

module.exports = {
    apply: vinylAstApply
};
