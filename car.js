class Car{

  constructor(x, y, width, height, controlType, maxSpeed = 3){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    //implementing kinematics into car motion
    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;         //left and right turn changes angle, begins at 90 deg on math unit circle

    this.damaged = false;

    this.useBrain = (controlType == "AI");

    if (controlType != "DUMMY"){
      this.sensor = new Sensor (this);    //car is passed if its main car
      
      //10 neurons in hidden layer 1
      //6 neurons in hidden layer 2
      //4 neurons in output layer for directions: fwd, bwd, left turn, right turn
      this.brain = new NeuralNetwork(
        [this.sensor.rayCount, 10, 6, 4]
      );
    }
    this.controls = new Controls(controlType);
  }

  update(roadBorders, traffic){
    
    if (!this.damaged){
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }

    //if we are using AI car, update their sensor readings
    if (this.sensor){
      this.sensor.update(roadBorders, traffic);
      
      //if null, then sensor doesn't see anything, give 0
      //else, sensor returns high value
      const offsets = this.sensor.readings.map(
        s=>s==null?0:1-s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain){ //if AI controls car, the car directions are controlled by whether or not the neurons in output layer are activated
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #assessDamage(roadBorders, traffic){
    //if car leaves road borders, it's damaged
    for(let i = 0; i < roadBorders.length; i++){
      if (polysIntersect(this.polygon, roadBorders[i])){
        return true;
      }
    }
    //if car hits another car, its damaged
    for(let i = 0; i < traffic.length; i++){
      if (polysIntersect(this.polygon, traffic[i].polygon)){
        return true;
      }
    }

    return false;
  }

  //function to find corners of car
  #createPolygon(){
    const points=[];
    const rad = Math.hypot(this.width,this.height) / 2; //distance from center of car to corner
    const alpha = Math.atan2(this.width,this.height);  
    points.push({
        x:this.x - Math.sin(this.angle - alpha) * rad,
        y:this.y - Math.cos(this.angle - alpha) * rad
    });
    points.push({
        x:this.x - Math.sin(this.angle + alpha) * rad,
        y:this.y - Math.cos(this.angle + alpha) * rad
    });
    points.push({
        x:this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
        y:this.y - Math.cos(Math.PI + this.angle - alpha) * rad
    });
    points.push({
        x:this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
        y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    });
    return points;
  }

  //changes acceleration based on key pressed
  #move(){
    if (this.controls.forward){
      this.speed += this.acceleration;
    } 
    if (this.controls.reverse){
      this.speed -= this.acceleration;
    }

    //max fwd speed
    if (this.speed > this.maxSpeed){
      this.speed = this.maxSpeed;
    }
    //max bwd speed
    if (this.speed < - this.maxSpeed/2){
      this.speed = -this.maxSpeed/2;
    }

    //implementing kinetic friction
    if (this.speed > 0){
      this.speed -= this.friction;
    }
    if (this.speed < 0){
      this.speed += this.friction;
    }

    //implementing static friction
    if (Math.abs(this.speed) < this.friction){
      this.speed= 0;
    }
    
    //implementing turning
    if (this.speed != 0){   //cannot turn if not moving
      //flip ensures that car moves left or right relative to the drivers POV
      const flip = this.speed >0?1:-1; //is 1 if speed >0, else -1

      if (this.controls.left){
        this.angle += 0.03 * flip;
      }
      if (this.controls.right){
        this.angle -= 0.03 * flip;
      }
    }

    //changing car position for x and y components
    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }



  //draw current car position
  draw (ctx, color, drawSensor = false){

    if (this.damaged){
      ctx.fillStyle = "gray";
    }
    else{
      ctx.fillStyle = color;
    }

    ctx.beginPath();
    ctx.moveTo(this.polygon[0].x, this.polygon[0].y);

    for (let i = 1; i < this.polygon.length; i++){
      ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
    }
    ctx.fill();

    if (this.sensor && drawSensor){
      this.sensor.draw(ctx);
    }
  }
}