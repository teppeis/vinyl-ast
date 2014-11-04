'use strict';

var Vinyl = require('vinyl');
var escodegen = require('escodegen');

// Original getter/setter methods of #contents
var vinylContents = Object.getOwnPropertyDescriptor(Vinyl.prototype, 'contents');

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
            vinylContents.set.call(this, null);
        }
    });

    // #contents
    Object.defineProperty(vinyl, 'contents', {
        get: function() {
            var current = vinylContents.get.call(this);
            if (!current && this.ast) {
                current = new Buffer(escodegen.generate(this.ast));
                vinylContents.set.call(this, current);
            }
            return current;
        },
        set: function(val) {
            vinylContents.set.call(this, val);
            this._ast = null;
        }
    });

    vinyl.isBuffer = function() {
        if (this.ast) {
            return true;
        } else {
            return Vinyl.prototype.isBuffer.call(this);
        }
    };

    vinyl.isStream = function() {
        if (this.ast) {
            return false;
        } else {
            return Vinyl.prototype.isStream.call(this);
        }
    };

    vinyl.isNull = function() {
        if (this.ast) {
            return false;
        } else {
            return Vinyl.prototype.isNull.call(this);
        }
    };

    vinyl.clone = function(opt) {
        var cloned = Vinyl.prototype.clone.call(this, opt);
        vinylAstApply(cloned);
        return cloned;
    };

    vinyl._ast = vinyl._ast || null;
}

module.exports = {
    apply: vinylAstApply
};
