var brain = require('brain');
var fs = require('fs');
var util = require('util');
var samples = 9999;

function convertTrainingData(data)
{
    var lines = data.toString().split('\n');
    console.log('[CONVERTER] Converting '+ lines.length +' samples...');
    convertedData = [];
    var time = new Date();
    for(var i = 0; i < lines.length; i++) {
        var input = lines[i].split(',');

        var actualInput = [];
        for (var j = 0; j < input.length; j++) {
            actualInput.push(parseInt(input[j]) / 255);
        };
        
        var output = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);
        output[actualInput.shift() * 255] = 1;
        convertedData.push({
            input: actualInput,
            output: output
        });
    }
    time = new Date() - time;
    console.log('[CONVERTER] Finished converting in '+ time +'ms.');
    return convertedData;
}


fs.readFile(__dirname + '/data/test.csv', function (err, testContent) {
    if (err) {
        console.log('[TEST] Failed:', err);
        return;
    }

    var testData = convertTrainingData(testContent);
    var testSample = testData;

    console.log('[TESTER] Testing with ' + testData.length + ' samples...');
    var myICR = new brain.NeuralNetwork()
    fs.readFile(__dirname + '/networks/brain_test.json', function (error, network) {
    	if (error) {
    		console.log('[TESTER] Failed:', err);
        	return;
    	}
    	network = JSON.parse(network);

    	myICR.fromJSON(network);
			var numRight = 0;

    	for (var i = 0; i < testSample.length; i++) {
	    	var resultArr = myICR.run(testSample[i].input);
	    	var result = resultArr.indexOf(Math.max.apply(Math, resultArr));
			var actual = testSample[i].output.indexOf(Math.max.apply(Math, testSample[i].output));
			
			numRight += result === actual ? 1 : 0;
	    }
		console.log('[TESTER] Finished testing.\n\n'
			+'SUCCEEDED: '+ numRight 
			+'\nFAILED:    '+ (samples-numRight) 
			+'\nTOTAL:     ' +samples
			+'\n=========\n'
			+'PRECISION: ' + String(100*(numRight/samples)) + '%');

    });

});
