// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/// <reference path="../typings/index.d.ts" />
/// <reference path="../_build/task.d.ts" />

import assert = require('assert');
import * as mt from '../_build/mock-task';
import * as mtm from '../_build/mock-test';
import * as mtr from '../_build/mock-toolrunner';
import * as ma from '../_build/mock-answer';
import * as tl from '../_build/task';

import testutil = require('./testutil');

describe('Mock Tests', function () {

    before(function (done) {
        try {
            testutil.initialize();
        }
        catch (err) {
            assert.fail('Failed to load task lib: ' + err.message);
        }
        done();
    });

    after(function () {

    });

    it('Mocks which and returns path on exists', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "which": {
                "foo": "/bar/baz"
            }
        };

        mt.setAnswers(a);
        assert.equal(mt.which('foo'), '/bar/baz');

        done();
    })
    it('Mock which and returns null on not exist', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "which": {
                "foo": "/bar/baz"
            }
        };

        mt.setAnswers(a);
        assert.equal(mt.which('foo2'), null);

        done();
    })
    it('Mocks exist and returns true on exists', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "exist": {
                "/foo/bar": true
            }
        };

        mt.setAnswers(a);
        assert(mt.exist('/foo/bar'));

        done();
    })
    it('Mocks exist and returns false on not exists', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "exist": {
                "/foo/bar": true
            }
        };

        mt.setAnswers(a);
        assert.equal(mt.exist('/foo/bar2'), false);

        done();
    })
    it('Mocks CheckPath with Success', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "checkPath": {
                "/foo/bar": true
            }
        };

        mt.setAnswers(a);
        mt.checkPath('/foo/bar', 'bar');

        done();
    })
    it('Mock CheckPath Throws', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "checkPath": {
                "/foo/bar": false
            }
        };

        mt.setAnswers(a);
        assert.throws(() => { mt.checkPath('/foo/bar', 'bar')});

        done();
    })

    it('match not mocked', (done) => {
        let actual: string[] = (mt as any).match(
            [
                '/foo',
                '/bar',
                '/baz',
            ],
            '/ba[rz]');
        assert.deepEqual(actual, [ '/bar', '/baz' ]);

        done();
    })

    it('filter not mocked', (done) => {
        let list = [
            '/foo',
            '/bar',
            '/baz',
        ];
        let actual: string[] = list.filter((mt as any).filter('/ba[rz]'));
        assert.deepEqual(actual, [ '/bar', '/baz' ]);

        done();
    })

    it('Mocks findMatch results', (done) => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "findMatch": {
                "/ba[rz]": [
                    "/bar",
                    "/baz",
                ]
            }
        };

        mt.setAnswers(a);
        var matches: string[] = mt.findMatch('/default-root', '/ba[rz]');
        assert.deepEqual(matches, [ '/bar', '/baz' ]);

        done();
    })

    it('Mock loc returns key', (done: MochaDone) => {
        let actual = mt.loc('STR_KEY');
        assert.equal(actual, 'loc_mock_STR_KEY');
        done();
    })

    it('Mock loc returns key and args', (done: MochaDone) => {
        let actual = mt.loc('STR_KEY', false, 2, 'three');
        assert.equal(actual, 'loc_mock_STR_KEY false 2 three');
        done();
    })

    it('Mock returns toolRunner', (done) => {
        let tool = mt.tool('atool');
        assert(tool, "tool should not be null");

        done();
    })

    it('Mock toolRunner returns success code', async () => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "exec": {
                "/usr/local/bin/atool --arg foo": {
                    "code": 0,
                    "stdout": "atool output here",
                    "stderr": "atool with this stderr output"
                }
            }
        };

        mt.setAnswers(a);

        let tool: mtr.ToolRunner = mt.tool('/usr/local/bin/atool');
        tool.arg('--arg');
        tool.arg('foo');
        let rc: number = await tool.exec(<mtr.IExecOptions>{});
        
        assert(tool, "tool should not be null");
        assert(rc == 0, "rc is 0");
    })

    it('Mock toolRunner returns success code for execTool', async () => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "execTool": {
                "/usr/local/bin/atool": (args: string[]) => {
		    assert.equal(args.indexOf("--arg"), 0, "--arg should be the first element");
		    assert.equal(args.indexOf("foo"), 1, "foo should be the second element");
		    return {
			"code": 0,
			"stdout": "atool output here",
			"stderr": "atool with this stderr output"
                    }
		}
            }
        };

        mt.setAnswers(a);

        let tool: mtr.ToolRunner = mt.tool('/usr/local/bin/atool');
        tool.arg('--arg');
        tool.arg('foo');
        let rc: number = await tool.exec(<mtr.IExecOptions>{});
        
        assert(tool, "tool should not be null");
        assert(rc == 0, "rc should be 0");
    })

    it('Mock toolRunner exeSync returns success code for execTool', async () => {
        var a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
            "execTool": {
                "/usr/local/bin/atool": (args: string[]) => {
		    assert.equal(args.indexOf("--arg"), 0, "--arg should be the first element");
		    assert.equal(args.indexOf("foo"), 1, "foo should be the second element");
		    return {
			"code": 0,
			"stdout": "atool output here",
			"stderr": "atool with this stderr output"
                    }
		}
            }
        };
	
        mt.setAnswers(a);

        let tool: mtr.ToolRunner = mt.tool('/usr/local/bin/atool');
        tool.arg('--arg');
        tool.arg('foo');
        let {code} = tool.execSync(<mtr.IExecOptions>{});
        assert(tool, "tool should not be null");
        assert(code == 0, "return code should be 0");
    })
});
