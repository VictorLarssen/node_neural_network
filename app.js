var synaptic = require('synaptic');
var fs = require('fs');
var util = require('util');
var Neuron = synaptic.Neuron,
	Layer = synaptic.Layer,
	Network = synaptic.Network,
	Trainer = synaptic.Trainer,
	Architect = synaptic.Architect;

var time = new Date();

function ICR(input, hidden, output)
{
	// create the layers
    var inputLayer = new Layer(input);
    var hiddenLayer = new Layer(hidden);
    var outputLayer = new Layer(output);

    // connect the layers
    inputLayer.project(hiddenLayer);
    hiddenLayer.project(outputLayer);

    // set the layers
    this.set({
        input: inputLayer,
        hidden: [hiddenLayer],
        output: outputLayer
    });
}

ICR.prototype = new Network();
ICR.prototype.constructor = ICR;

function convertTrainingData(data)
{
	var lines = data.toString().split('\n');
	convertedData = [];
	time = new Date();
	for(var i = 0; i < lines.length; i++) {
		var input = lines[i].split(',').map(function(value) {
			return parseInt(value);
		});
		var output = input.slice(0, 1);
		input.splice(0,1);
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
    var trainSample = trainData.slice(0, 2000);
    console.log(util.inspect(process.memoryUsage()));

    console.log('Got ' + trainData.length + ' samples');
    var myICR = new ICR(784, 200, 1);
    var myTrainer = new Trainer(myICR);
    console.log(myTrainer);
    
    time = new Date();
    myTrainer.train(trainSample, {
    	iterations: 20,
        shuffle: true,
    	log: 5,
    	schedule: {
		    every: 5, // repeat this task every 20 iterations
		    do: function(data) {
		        console.log(data);
                console.log(util.inspect(process.memoryUsage()));
		    }
		}
    });
    var trainingTime = new Date() - time;
    console.log('Training time: ' + trainingTime);
    saveNetwork(myICR);
    
    /*myTrainer.train(trainSample, {
    	rate: .1,
    	iterations: 2000,
    	error: .005,
    	shuffle: false,
    	log: 10,
    	//cost: Trainer.cost.CROSS_ENTROPY,
    	schedule: {
		    every: 20, // repeat this task every 20 iterations
		    do: function() {
		        time = new Date() - time;
		        console.log("Iteration time log: " + time);
		    }
		}
    });*/
	
});

function saveNetwork(network) {
	var networkJson = network.toJSON();
    fs.writeFile("networks/test.json", JSON.stringify(networkJson, null, 4), function(err) {
    	if(err) {
    		return console.log("Writing error: " + err);
    	}

    	console.log("The file was saved!");
    });
}

