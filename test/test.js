'use strict';

var crypto = require('crypto');
var tape = require('tape');
var Buffer = require('safe-buffer').Buffer;

var Sha1 = require('../').sha1;

var inputs = [
	['', 'ascii'],
	['abc', 'ascii'],
	['123', 'ascii'],
	['123456789abcdef123456789abcdef123456789abcdef123456789abcdef', 'ascii'],
	['123456789abcdef123456789abcdef123456789abcdef123456789abc', 'ascii'],
	['123456789abcdef123456789abcdef123456789abcdef123456789ab', 'ascii'],
	['0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde', 'ascii'],
	['0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'ascii'],
	['foobarbaz', 'ascii']
];

tape("hash is the same as node's crypto", function (t) {
	inputs.forEach(function (v) {
		var a = new Sha1().update(v[0], v[1]).digest('hex');
		var e = crypto.createHash('sha1').update(v[0], v[1]).digest('hex');
		console.log(a, '==', e);
		t.equal(a, e);
	});

	t.end();
});

tape('call update multiple times', function (t) {
	inputs.forEach(function (v) {
		var hash = new Sha1();
		var sha1hash = crypto.createHash('sha1');

		for (var i = 0; i < v[0].length; i = (i + 1) * 2) {
			var s = v[0].substring(i, (i + 1) * 2);
			hash.update(s, v[1]);
			sha1hash.update(s, v[1]);
		}

		var a = hash.digest('hex');
		var e = sha1hash.digest('hex');
		console.log(a, '==', e);
		t.equal(a, e);
	});
	t.end();
});

tape('call update twice', function (t) {
	var sha1hash = crypto.createHash('sha1');
	var hash = new Sha1();

	sha1hash.update('foo', 'ascii');
	hash.update('foo', 'ascii');

	sha1hash.update('bar', 'ascii');
	hash.update('bar', 'ascii');

	sha1hash.update('baz', 'ascii');
	hash.update('baz', 'ascii');

	var a = hash.digest('hex');
	var e = sha1hash.digest('hex');

	t.equal(a, e);
	t.end();
});

tape('hex encoding', function (t) {
	inputs.forEach(function (v) {
		var hash = new Sha1();
		var sha1hash = crypto.createHash('sha1');

		for (var i = 0; i < v[0].length; i = (i + 1) * 2) {
			var s = v[0].substring(i, (i + 1) * 2);
			hash.update(Buffer.from(s, 'ascii').toString('hex'), 'hex');
			sha1hash.update(Buffer.from(s, 'ascii').toString('hex'), 'hex');
		}
		var a = hash.digest('hex');
		var e = sha1hash.digest('hex');

		console.log(a, '==', e);
		t.equal(a, e);
	});

	t.end();
});

tape('call digest for more than MAX_UINT32 bits of data', function (t) {
	var sha1hash = crypto.createHash('sha1');
	var hash = new Sha1();
	var bigData;
	try {
		bigData = Buffer.alloc(0x1ffffffff / 8);
	} catch (err) {
		// node < 3 has a lower buffer size limit than node 3+. node 0.10 requires the `/8`, 0.12 - 2 are fine with `-8`
		bigData = Buffer.alloc(0x3fffffff / 8);
	}

	hash.update(bigData);
	sha1hash.update(bigData);

	var a = hash.digest('hex');
	var e = sha1hash.digest('hex');

	t.equal(a, e);
	t.end();
});
