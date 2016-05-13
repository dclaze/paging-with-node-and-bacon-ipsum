var baconIpsumPaginator = require('./index.js');

function fakeCallback(error, results){
	console.log(results)
}

var fakeContext = {
	done: fakeCallback
};

baconIpsumPaginator.handler({take: 5, skip:0, batchSize: 2}, fakeContext, fakeCallback);