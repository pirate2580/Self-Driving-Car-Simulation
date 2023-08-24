const canvas = document.getElementById("myCanvas");
canvas.width = 200;

const ctx = canvas.getContext("2d"); //2d context
const road = new Road(canvas.width/2, canvas.width*0.9);

const cars = generateCars(500);  //control has been changed from keyboard KEYS, to AI
const carFitness = Array (500);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")){
  for (let i = 0; i < cars.length; i++){
    
    //we make the new cars have the same NN as best car
    cars[i].brain = JSON.parse(
      localStorage.getItem("bestBrain")
    );
    if (i!= 0){
      NeuralNetwork.fixOverfit(cars[i].brain, 0.4); 
    }
  }
}

//implementing random traffic 
const traffic = [];
for (let i = 0; i < 100; i++){
  traffic.push(new Car (road.getLaneCenter(Math.floor(3 * Math.random())), -i * 100, 30, 50, "DUMMY", 2));
}

animate()

function save(){
  localStorage.setItem("bestBrain",
  JSON.stringify(bestCar.brain));
}

function discard(){

}

function fitness(cars, traffic){
  //the fitness is now defined by how many cars our AI car passes
  //we update array of fittest cars

  for (let i = 0; i < cars.length; i++){
    let fitVal = 0;
    for (let j = 0; j < traffic.length; j++){
      if (cars[i].y < traffic[j].y){    //if car passed
        fitVal += 1;
      }
    }
    carFitness[i] = fitVal; //incentivizes passing cars
  }
}

function generateCars(N){
  //function to run multiple AI cars simultaneously: parallelization
  const cars = [];

  for (let i = 1; i <= N; i++){
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function animate(){

  //updating traffic cars
  for (let i = 0; i < traffic.length; i++){
    traffic[i].update(road.borders, []);     
  }

  //updating main car
  for (let i = 0; i < cars.length; i++){
    cars[i].update(road.borders, traffic);
  }

  
  fitness(cars, traffic);
  bestCar = cars[carFitness.indexOf(Math.max(...carFitness))];
  //legacy: former fitness function
  /*
  bestCar = cars.find(
    c=>c.y == Math.min(
      ...cars.map(c=>c.y)
    )
  );*/
  
  canvas.height = window.innerHeight; //resizing the canvas clears it, ensuring old car position isn't seen
  

  //makes the car 'stationary' while the road moves in adjustment to car
  ctx.save();
  ctx.translate(0, -bestCar.y + canvas.height * 0.7);



  road.draw(ctx);

  //draw traffic cars
  for (let i = 0; i < traffic.length; i++){
    traffic[i].draw(ctx, "red");
  }

  //draw main car
  ctx.globalAlpha = 0.2;    //implementing transparency, does it work, check?
  for (let i = 0; i < cars.length; i++){
    cars[i].draw(ctx, "blue");
  }

  ctx.globalAlpha = 1;
  bestCar.draw(ctx, "blue", true);

  ctx.restore();
  requestAnimationFrame(animate);   //requestAnimationFrame calls animate function over and over, giving illusion of movement
}