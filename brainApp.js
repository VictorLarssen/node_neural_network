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
			return parseInt(value);
		});
		var output = Array.apply(null, Array(10)).map(Number.prototype.valueOf, 0);
		output[input.shift()] = 1;
		convertedData.push({
			input: input, 
			output: output
		});
	}
	time = new Date() - time;
	console.log("Converting data: " + time);
	return convertedData;
}

fs.readFile(__dirname + '/data/train.csv', function (err, trainContent) {  
    if (err) {
        console.log('Error:', err);
    }

    console.log(util.inspect(process.memoryUsage()));
    var trainData = convertTrainingData(trainContent);
    var trainSample = trainData.slice(0, 10000);
    console.log(util.inspect(process.memoryUsage()));

    console.log('Got ' + trainData.length + ' samples');
    var myICR = new brain.NeuralNetwork({
    	hiddenLayers: [392, 196]
    })
    
    time = new Date();
    myICR.train(trainSample, {
    	iterations: 50,
    	log: true,
    	logPeriod: 1,
    	learningRate: 0.2
    });
    
    var trainingTime = new Date() - time;
    console.log('Training time: ' + trainingTime);
    saveNetwork(myICR);
	
});

function saveNetwork(network) {
	var networkJson = network.toJSON();
    fs.writeFile("networks/brain_test.json", JSON.stringify(networkJson, null, 4), function(err) {
    	if(err) {
    		return console.log("Writing error: " + err);
    	}

    	console.log("The file was saved!");
    });
}