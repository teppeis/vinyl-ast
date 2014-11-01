'use strict';

var assert = require('power-assert');
var esprima = require('esprima');
var Vinyl = require('vinyl');

var VinylAst = require('../index');

describe('VinylAst', function() {
    describe('constructor()', function() {
        it('should instantiate', function() {
            assert(new VinylAst() instanceof VinylAst);
        });

        it('should inherits Vinyl', function() {
            var sut = new VinylAst();
            assert(sut instanceof Vinyl);
        });

        it('should give the args to Vinyl', function() {
            var buf = new Buffer('foo');
            var sut = new VinylAst({contents: buf});
            assert(sut.contents === buf);
            assert(sut.isBuffer());
        });
    });

    context('#ast is not given', function() {
        var sut, buf;
        beforeEach(function() {
            sut = new VinylAst();
            buf = new Buffer('foo');
            sut.contents = buf;
        });

        describe('#ast', function() {
            it('should be null', function() {
                assert(sut.ast === null);
            });
        });

        describe('#contents', function() {
            it('should be the given buffer', function() {
                assert(sut.contents === buf);
            });

            it('should be null after #ast is modified', function() {
                assert(sut.contents === buf);
            });
        });
    });

    context('#ast is given', function() {
        var sut, src, ast;
        beforeEach(function() {
            src = "var foo = 'foo';";
            ast = esprima.parse(src);
            sut = new VinylAst({ast: ast});
        });

        describe('#ast', function() {
            it('should be set by constructor', function() {
                assert(sut.ast === ast);
            });

            it('should be null after #contents is modified', function() {
                sut.contents = new Buffer('foo');
                assert(sut.ast === null);
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

        context('#astSource is given', function() {
            var astSource;
            beforeEach(function() {
                astSource = "var src = 'awsome!';";
                sut.astSource = astSource;
            });

            describe('#contents', function() {
                it('should be specified astSource', function() {
                    assert(sut.contents instanceof Buffer);
                    assert(sut.contents.toString() === astSource);
                });
            });

            describe('#astSource', function() {
                it('should be null after #ast is modified', function() {
                    sut.ast = {};
                    assert(sut.astSource === null);
                });

                it('should be null after #contents is modified', function() {
                    sut.contents = new Buffer('foo');
                    assert(sut.astSource === null);
                });
            });
        });
    });
});
