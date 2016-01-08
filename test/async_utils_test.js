var should = require('should');
var sinon = require('sinon');

var asyncUtils = require('../async-utils.js');

describe('applyIE', function() {
	
	it('should yield the applied function with the result', function(done) {

		var mock_result = 'ok';
		var mock_fx = sinon.stub().yields(undefined, mock_result);

		var applied_fx = asyncUtils.applyIE(mock_fx);

		applied_fx(function(error, result) {
			should.not.exist(error);
			result.should.be.eql(mock_result);
			done();
		});
	});

	it('should partially apply the arguments to the provided function', function(done) {

		var mock_arg = 1;
		var mock_fx = sinon.stub().yields();

		var applied_fx = asyncUtils.applyIE(mock_fx, mock_arg);

		applied_fx(function() {
			mock_fx.calledWith(mock_arg).should.be.equal(true);
			done();
		});
	});

	it('should accept new arguments after partially applied arguments were applied', function(done) {

		var mock_arg = 1;
		var mock_arg_two = 2;

		var mock_fx = sinon.stub().yields();

		var applied_fx = asyncUtils.applyIE(mock_fx, mock_arg);

		applied_fx(mock_arg_two, function() {
			mock_fx.calledWith(mock_arg, mock_arg_two).should.be.equal(true);
			done();
		});
	});	

	it('should yield the applied function with undefined if an error', function(done) {

		var mock_result = 'error';
		var mock_fx = sinon.stub().yields(mock_result);

		var applied_fx = asyncUtils.applyIE(mock_fx);

		applied_fx(function(error, result) {
			should.not.exist(error);
			should.not.exist(result);
			done();
		});
	});	
});

describe('intercept', function() {
	
	it('should call the cb if no error', function(done) {
		var mock_response = 'ok';
		var mock_fx = sinon.stub().yields(undefined, mock_response);
		
		var mock_cb = sinon.spy(function(error) {
			throw new Error('should not be called');
		});
		
		mock_fx(asyncUtils.intercept(mock_cb, function(response) {
			response.should.be.eql(mock_response)
			mock_cb.callCount.should.be.equal(0);
			done();
		}));
	});

	it('should call the provided fx with an error', function(done) {
		var mock_error = 'error';
		var mock_fx = sinon.stub().yields(mock_error);
		
		var mock_cb = sinon.spy(function(error) {
			should.exist(error);
			done();
		});
		
		mock_fx(asyncUtils.intercept(mock_cb, function(response) {
			throw new Error('should not be called');
		}));
	});
});

describe('pluck', function() {
	
	var error = {
		msg: 'fail'
	};

	var response = {
		msg: 'level 0',
		l1: {
			msg: 'level 1',
			l2: {
				msg: 'level 2',
				l3: {
					msg: 'level 3',
					array: ['primero']
				}
			}
		}
	};

	var mockOp = function(fail) {
		return function(cb) {
			if (fail) return cb(error);
			return cb(undefined, response);
		};
	};
	
	it('should yield an error if the cb is called with an error', function(done) {
		var op = mockOp('fail');
		op(asyncUtils.pluck('msg', function cb(error, msg) {
			should.exist(error);
			should.not.exist(msg);
			done();
		}));
	});

	it('should yield the selected property of the response', function(done) {
		var op = mockOp();
		op(asyncUtils.pluck('msg', function cb(error, msg) {
			should.not.exist(error);
			should.exist(msg);
			msg.should.be.equal('level 0');
			done();
		}));
	});

	it('should yield the selected property of the response (nested property)', function(done) {
		var op = mockOp();
		op(asyncUtils.pluck('l1.l2.l3.array[0]', function cb(error, msg) {
			should.not.exist(error);
			should.exist(msg);
			msg.should.be.equal('primero');
			done();
		}));
	});

	it('should yield null if the select property fails ', function(done) {
		var op = mockOp();
		op(asyncUtils.pluck('l1.l2.propiedad_inexistente.array[0]', function cb(error, msg) {
			should.not.exist(error);
			should.not.exist(msg);
			done();
		}));
	});
});

describe('fuse', function() {

	var getTimedCb = function(ms, error, response) {
		return function(cb) {
			setTimeout(function() {
				cb(error, response);
			}, ms);
		};
	};

	it('should yield a response normally if callback has been executed within the timeout', function(done) {
		var asyncFx = getTimedCb(10, undefined, 'ok');
		
		asyncFx(asyncUtils.fuse(50, function(error, response) {
			should.not.exist(error);
			should.exist(response);
			response.should.be.equal('ok');
			done();
		}));

	});
	
	it('should yield an error normally if callback has been executed within the timeout', function(done) {
		var asyncFx = getTimedCb(10, 'error', undefined);
		
		asyncFx(asyncUtils.fuse(50, function(error, response) {
			should.exist(error);
			should.not.exist(response);
			error.should.be.equal('error');
			done();
		}));

	});
	
	it('should yield an async-utils error if callback has not been executed within the timeout', function(done) {
		var asyncFx = getTimedCb(50, 'error', undefined);
		
		asyncFx(asyncUtils.fuse(10, function(error, response) {
			should.exist(error);
			should.not.exist(response);
			error.should.be.equal('async-utils fuse timeout rechead!');
			done();
		}));

	});
});