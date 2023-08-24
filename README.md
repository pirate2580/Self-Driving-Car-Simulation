# Self-Driving-Car-Simulation
I implemented a small neural network without any libraries in javascript to simulate a self-driving car on a road full of traffic, following along with this tutorial from freecodecamp: https://www.youtube.com/watch?v=Rs_rAxEsAvI

I made some changes to the code from the video though, the most significant that come to mind are:
- adding multiple dummy cars for traffic obstacles
- creating relu and sigmoid activation functions in util.js
- using sigmoid activation for each neuron in a given layer
- creating a fitness function in main.js that measures the neural network's performance by the number of cars it passes rather than how far the car goes up the road.
