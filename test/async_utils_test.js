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