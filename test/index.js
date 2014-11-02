'use strict';

var assert = require('power-assert');
var esprima = require('esprima');
var Vinyl = require('vinyl');

var vinylAst = require('../index');

describe('vinylAst', function() {
    var sut, buf;
    beforeEach(function() {
        sut = new Vinyl();
        buf = new Buffer('foo');
        sut.contents = buf;
        sut.customProp = 'bar';

        vinylAst.apply(sut);
    });

    describe('#apply()', function() {
        it('should keep original inheritence', function() {
            assert(sut instanceof Vinyl);
            assert(sut.isBuffer());
            assert(sut.contents === buf);
            assert(sut.customProp === 'bar');
        });

        it('#clone');

        it('should set null to #ast', function() {
            assert(sut.ast === null);
        });
    });

    context('when #ast is assigned', function() {
        var src, ast;
        beforeEach(function() {
            src = "var foo = 'foo';";
            ast = esprima.parse(src);
            sut.ast = ast;
        });

        describe('#ast', function() {
            it('should be assigned ast', function() {
                assert(sut.ast === ast);
            });

            it('should be assigned ast after getting #contents', function() {
                assert(sut.contents instanceof Buffer);
                assert(sut.ast === ast);
            });
        });

        describe('#contents', function() {
            it('should be generated astSource buffer', function() {
                assert(sut.contents instanceof Buffer);
                assert(sut.contents.toString() === src);
            });
        });

        describe('#isBuffer()', function() {
            it('should be true for compatibility', function() {
                assert(sut.isBuffer());
            });
        });
    });

    context('apply twice', function() {
    });
});
