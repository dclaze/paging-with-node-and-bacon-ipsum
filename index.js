var http = require('http'),
	Q = require('q');


function buildBacomIpsumHttpRequestString(start, take){
	return 'http://baconipsum.com/api/?type=all-meat&sentences='+(take||1)+'&start-with-lorem='+ (start || 0);
}

function getAllBaconIpsumHttpRequestOptions(numberOfSentences, startingAt, batchSize){
	var options = [],
		count = 0,
		numberOfSentences = numberOfSentences || 1,
		startingAt = startingAt || 0,
		batchSize = batchSize || 1;
	
	for(var i = startingAt; i < numberOfSentences + startingAt; i++){
		count++;
		if(count == batchSize){
			options.push(buildBacomIpsumHttpRequestString(i-(count-1), count));
			count = 0;
		}
	}
	if(count > 0)
		options.push(buildBacomIpsumHttpRequestString(numberOfSentences + startingAt - (count-1), count));

	return options;
}

function callBaconIpsumAPI(options) {
	var deferred = Q.defer();

    http.get(options, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            deferred.resolve(parsed[0].match(/[^\.!\?]+[\.!\?]+/g));
        });
        response.on('error', function(){
    		deferred.reject(parsed);
        });
    });

	return deferred.promise;
}

function getAllBaconIpsums(take, skip, batchSize){
	var allOptions = getAllBaconIpsumHttpRequestOptions(take, skip, batchSize),
		result = Q();

	allOptions.forEach(function (option) {
	    result = result.then(function(existingResults){
	    	return callBaconIpsumAPI(option).then(function(newResults){
	    		existingResults = existingResults || [];
	    		return Q.when(existingResults.concat(newResults));
	    	});
	    });
	});

	return result;
}

exports.handler = function(event, context, callback){
	var take = event.take || 1,
		skip = event.skip || 0,
		batchSize = event.batchSize || 1;
		
	getAllBaconIpsums(take, skip, batchSize).then(function(baconIpsums){
		callback(null, baconIpsums);
	}, function(error){
		callback(error);
	});
}

