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
	
});