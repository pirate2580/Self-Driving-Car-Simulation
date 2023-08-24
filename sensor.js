
class Sensor{
  constructor(car){
    
    this.car = car;
    this.rayCount = 5;    //number of camera rays extending from car
    this.rayLength = 150; //how far the ray detects
    this.raySpread = Math.PI/2;   //90 degree ray spread

    this.rays = [];
    this.readings = [];

  }

  update(roadBorders, traffic){
    this.#castRays();       //adds sensor line segs to rays array
    this.readings = [];

    for (let i = 0; i < this.rays.length; i++){
      //intersection of ith ray with road borders
      this.readings.push(
        this.#getReading(
          this.rays[i], 
          roadBorders,
          traffic
          )
      );
    }
  }

  #getReading(ray, roadBorders, traffic){
    let touches = [];

    for (let i = 0; i < roadBorders.length; i++){
      //ordered pair for point of intersection of given ray and either road border
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );

      if (touch){
        touches.push(touch)
      }
    }

    for (let i = 0; i < traffic.length; i++){
      const poly = traffic[i].polygon;
      for (let j = 0; j < poly.length; j++){
        const value = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j+1)%poly.length]
        );
        if(value){
          touches.push(value);
        }
      }
    }

    if (touches.length == 0){
      return null;
    }
    else{
      //array of how each ray is from the border
      const offsets = touches.map(e=>e.offset);
      const minOffset = Math.min(...offsets); //... spreads into many diff vals
      return touches.find (e=>e.offset == minOffset);
    }
  }

  #castRays(){
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++){

      //on math unit circle, the ray is from 135 degrees to 45 degrees
      const rayAngle = lerp(this.raySpread/2, -this.raySpread/2, this.rayCount ==1? 0.5: i/(this.rayCount -1) ) + this.car.angle;

      const start = {x:this.car.x, y: this.car.y};
      
      //trig to get components of endpt
      const end = {x: this.car.x -  Math.sin(rayAngle) * this.rayLength, y: this.car.y - Math.cos(rayAngle) * this.rayLength};

      //pushing into rays as two endpts for line segment
      this.rays.push([start, end]);
    }
  }

  draw (ctx){
    for (let i = 0; i < this.rayCount; i++){
      
      let end = this.rays[i][1];

      //if there is reading, then: 
      if (this.readings[i]){
        end = this.readings[i];
      }


      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";

      ctx.moveTo(
        this.rays[i][0].x,
         this.rays[i][0].y
      );
      ctx.lineTo(
        end.x, 
        end.y
      );

      ctx.stroke();

      
      //where ray would have continued
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";

      ctx.moveTo(
        this.rays[i][1].x,
        this.rays[i][1].y
      );

      ctx.lineTo(
        end.x,
        end.y
      );
      ctx.stroke();
    }
  }
}