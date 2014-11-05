'use strict';

var assert = require('power-assert');
var esprima = require('esprima');
var escodegen = require('escodegen');
var sinon = require('sinon');
var Vinyl = require('vinyl');

var vinylAst = require('../index');

describe('vinylAst', function() {
    var sut, buf, sandbox;
    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        sandbox.spy(escodegen, 'generate');

        sut = new Vinyl();
        buf = new Buffer('foo');
        sut.contents = buf;
        sut.customProp = 'bar';

        vinylAst.apply(sut);
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('#apply()', function() {
        it('keeps original inheritence', function() {
            assert(sut instanceof Vinyl);
            assert(sut.isBuffer());
            assert(!sut.isStream());
            assert(!sut.isNull());
            assert(sut.contents === buf);
            assert(sut.customProp === 'bar');
        });

        it('sets null to #ast', function() {
            assert(sut.ast === null);
        });

        it('can be called many times', function() {
            vinylAst.apply(sut);

            assert(sut instanceof Vinyl);
            assert(sut.isBuffer());
            assert(sut.contents === buf);
            assert(sut.customProp === 'bar');
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
            it('is assigned AST', function() {
                assert(sut.ast === ast);
            });

            it('is not changed after getting #contents', function() {
                assert(sut.contents instanceof Buffer);
                assert(sut.ast === ast);
            });
        });

        describe('#contents', function() {

            it('is buffer of generated AST source', function() {
                assert(sut.contents instanceof Buffer);
                assert(sut.contents.toString() === src);
            });

            it('returns updated source for latest AST after #ast is modified', function() {
                assert(sut.contents.toString() === src);

                var newSrc = "var foo = 'updated';";
                sut.ast = esprima.parse(newSrc);
                assert(sut.contents.toString() === newSrc);
            });

            it('calls escodegen only once even if it is referenced many times', function() {
                assert(escodegen.generate.callCount === 0);
                assert(sut.contents.toString() === src);
                assert(escodegen.generate.callCount === 1);
                assert(sut.contents.toString() === src);
                assert(escodegen.generate.callCount === 1);
            });

            it('returns cached old source if #ast object property is changed', function() {
                // This behavior is restriction on the implementation.
                // Only Object.observe is the solution.

                // cache old source
                assert(sut.contents.toString() === src);
                // change AST: "var foo" => "var bar"
                sut.ast.body[0].declarations[0].id.name = 'bar';
                // cached old source is returned
                assert(sut.contents.toString() === src);
            });
        });

        describe('#isBuffer()', function() {
            it('returns true for compatibility', function() {
                assert(sut.isBuffer());
            });

            it('do not call escodegen internally', function() {
                assert(escodegen.generate.callCount === 0);
                sut.isBuffer();
                assert(escodegen.generate.callCount === 0);
            });
        });

        describe('#isStream()', function() {
            it('returns false', function() {
                assert(!sut.isStream());
            });

            it('do not call escodegen internally', function() {
                assert(escodegen.generate.callCount === 0);
                sut.isStream();
                assert(escodegen.generate.callCount === 0);
            });
        });

        describe('#isNull()', function() {
            it('returns false', function() {
                assert(!sut.isNull());
            });

            it('do not call escodegen internally', function() {
                assert(escodegen.generate.callCount === 0);
                sut.isNull();
                assert(escodegen.generate.callCount === 0);
            });
        });

        describe('#clone()', function() {
            it('copies all attributes including #ast', function() {
                sut.csd = '/';
                sut.base = '/test/';
                sut.path = '/test/test.coffee';

                var cloned = sut.clone();

                assert(cloned !== sut, 'refs should be different');
                assert(cloned.cwd === sut.cwd);
                assert(cloned.base === sut.base);
                assert(cloned.path === sut.path);
                assert(cloned.ast === sut.ast);
                assert(cloned.contents !== sut.contents, 'buffer ref should be different');
                assert(cloned.contents.toString() === sut.contents.toString());
            });

            it('copies deeply when opt is true', function() {
                var cloned = sut.clone(true);

                assert(cloned.ast !== sut.ast, 'refs should be different');
                assert.deepEqual(cloned.ast, sut.ast);
            });
        });
    });
});
