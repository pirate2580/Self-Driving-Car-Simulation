class NeuralNetwork{
  constructor (neuronCounts){
    this.levels = []; //an array of the levels in this network
    for (let i = 0; i < neuronCounts.length -1; i++){
      this.levels.push(new Level(
        neuronCounts[i], neuronCounts[i+1]
      ));
    }
  }
  
  static feedForward(givenInputs, network){
    let outputs = Level.forwardProp(
      givenInputs, network.levels[0]);    //raw input from sensor going into layer 1, indexed layer 0

    for (let i = 1; i < network.levels.length; i++){
      //this is dynamic programming isn't it? Building a new layer from previous computations
      outputs = Level.forwardProp(
        outputs, network.levels[i]);
      
    }
    return outputs;
  }

  //regularize to reduce overfitting of NN
  static fixOverfit(network, lambda = 1){
    network.levels.forEach(level => {
      
      //randomize biases slightly with linear interpolation
      for(let i = 0; i < level.biases.length; i++){
        level.biases[i] = lerp(
          level.biases[i],
          Math.random() * 2 - 1,    
          lambda
        )
      }

      for (let i = 0; i < level.weights.length; i++){
        for (let j = 0; j < level.weights[i].length; j++){
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 -1,   
            lambda
          )
        }
      }

    });
  }
}

class Level{
  //a level has a layer of input neurons and a layer of output neurons, the number of input neurons and output neurons do not have to match
  
  constructor(inputCount, outputCount){
    this.inputs = new Array(inputCount);    //a column vector x, each sensor provides an input value
    this.outputs = new Array(outputCount);  //a column vector y, the output for that layer
    this.biases = new Array(outputCount);   //biases: column vector b loosely representing the offset for the neuron to activate

    //we want to connect every input neuron to every output neuron. Backprop used to lower the weight for inputs with less importance

    this.weights = [];      //inputCountxoutputCount sized matrix
                            //each column is a vector of weights for a given neuron in the output layer

    //instantiating the matrix
    for (let i = 0; i < inputCount; i++){
      this.weights[i] = new Array(outputCount); 
    }

    Level.#randomize(this);   //randomizing weights and biases
  }

  static #randomize(level){
    //done to serialize method

    //we set the vals in the weight matrix for that level to random values
    for (let i = 0; i < level.inputs.length; i++){
      for (let j = 0; j < level.outputs.length; j++){
        level.weights[i][j] = Math.random()*2-1;      //random val between -1 and 1
      }
    }

    for (let i = 0; i < level.biases.length; i++){
      level.biases[i] = Math.random()*2 - 1;
    }
  }
  
  static forwardProp(givenInputs, level){
    /*
      forward prop algorithm, y = Wx + b
    */

    for (let i = 0; i < level.inputs.length; i++){
      level.inputs[i] = givenInputs[i];   //put values for input in input vector which was initialized with no vals
    }

    for (let i = 0; i < level.outputs.length; i++){
      let y_i = 0;  //the output for ith neuron in output layer

      for (let j = 0; j < level.inputs.length; j++){
        
        y_i += level.weights[j][i] * level.inputs[j]; //computing dot product of input col vector and ith column of weight matrix
      }
      y_i += level.biases[i]; //adding bias
      y_i = sigmoid(y_i); //sigmoid activation
      level.outputs[i] = y_i > 0.5?1: 0;  //acivate neuron if above 0 threshold

      /*code for relu activation:
      y_i = relu(y_i);
      levels.outpus[i] = y_i > 0? 1:0;
      */
    }

    return level.outputs;
  }
}