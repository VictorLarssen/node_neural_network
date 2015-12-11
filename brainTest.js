var brain = require('brain');
var fs = require('fs');
var util = require('util');


function convertTrainingData(data)
{
	var lines = data.toString().split('\n');
	convertedData = [];
	time = new Date();
	for(var i = 0; i < lines.length; i++) {
		var input = lines[i].split(',').map(function(value) {
			return parseInt(value) / 255;
		});
		var output = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);
		output[input.shift() * 255] = 1;
		convertedData.push({
			input: input, 
			output: output
		});
	}
	time = new Date() - time;
	console.log("Converting data: " + time);
	return convertedData;
}

fs.readFile(__dirname + '/data/test.csv', function (err, testContent) {  
    if (err) {
        console.log('Error:', err);
    }

    console.log(util.inspect(process.memoryUsage()));
    var testData = convertTrainingData(testContent);
    var testSample = testData.slice(0, 20);
    console.log(util.inspect(process.memoryUsage()));

    console.log('Got ' + testData.length + ' samples');
    var myICR = new brain.NeuralNetwork()
    fs.readFile(__dirname + '/networks/brain_test.json', function (error, network) {
    	if (error) {
    		console.log('Error', error);
    	}
    	network = JSON.parse(network);

    	myICR.fromJSON(network);
    	for (var i = 0; i < testSample.length; i++) {
    	var resultArr = myICR.run(testSample[i].input);
    	var result = resultArr.indexOf(Math.max.apply(Math, resultArr));
		var actual = testSample[i].output.indexOf(Math.max.apply(Math, testSample[i].output));

		var str = '(' + i + ') GOT: ' + result + ', ACTUAL: ' + actual;
		

		console.log(str);
    }
    });

});
