var brain = require('brain');
var fs = require('fs');
var util = require('util');
var cliChart = require('cli-chart');
var chart = new cliChart({
    xlabel: 'Iterations',
    ylabel: 'Error-rate',
    direction: 'y',
    width: 80,
    height: 20,
    lmargin: 15,
    step: 2
});

// Training settings
var _samples = 60000;
var _iterations = 2000;
var _error = 0.0003;
var _learningRate = 0.4;

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

fs.readFile(__dirname + '/data/train.csv', function (err, trainContent) {
    if (err) {
        console.log('[TRAINER] Failed:', err);
        return;
    }

    var trainData = convertTrainingData(trainContent);
    var trainSample = trainData.slice(0, _samples);
    console.log('[TRAINER] Training with ' + _samples + ' samples...');
    var myICR = new brain.NeuralNetwork({
    	hiddenLayers: [392, 196]
    })

    time = new Date();
    myICR.train(trainSample, {
    	errorThresh: _error,
    	iterations: _iterations,
        callbackPeriod: 1,
    	learningRate: _learningRate,
        callback: function(result){
            console.log('\033[2J');
            chart.addBar(result.error);
            chart.draw();
            console.log('[TRAINER] Iteration '+result.iterations+' finished. Error-rate is '+result.error+'.');
        }
    });

    var trainingTime = new Date() - time;
    console.log('[TRAINER] Finished training in '+ trainingTime +'ms.');
    saveNetwork(myICR);
});

function saveNetwork(network) {
	var networkJson = network.toJSON();
    fs.writeFile('networks/brain_test.json', JSON.stringify(networkJson, null, 4), function(err) {
    	if(err) {
    		return console.log('[SAVE] Failed: ' + err);
    	}else{
            console.log('[SAVE] The file was saved!');
        }
    });
}
