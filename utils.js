function lerp (A, B, t) {
  //Linear interpolation, draws lines dividing each lane
  return A + (B-A)*t;
}

function getIntersection(A,B,C,D){ 

  //if there is intersection of line seg AB and CD: return ordered pair of intersection point
  //else: return nothing

  const tTop = (D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);   //|CD.x  CD.y|
                                                          //|CA.x  CA.y|

  const uTop = (C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);   //|BA.x  BA.y|
                                                          //|AC.x  AC.y|

  const bottom = (D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y); //|AB.x  AB.y|
                                                          //|CD.x  CD.y|
  
  if(bottom != 0){
      const t = tTop/bottom;
      const u = uTop/bottom;
      if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
          return {
              x:lerp(A.x,B.x,t),
              y:lerp(A.y,B.y,t),
              offset:t
          }
      }
  }

  return null;
}

function polysIntersect(poly1, poly2){
  for (let i = 0; i < poly1.length; i ++){
    for (let j = 0; j < poly2.length; j++){
      //does ith line of polygon 1 intersect jth line of polygon 2? If yes, then they intersect
      const touch = getIntersection (
        poly1[i],
        poly1[(i+1)%poly1.length],
        poly2[j],
        poly2[(j+1)%poly2.length]
      );

      if (touch){
        return true;
      }
    }
  }
  return false;
}

function sigmoid (z) {
  return 1/(1 + Math.exp(-z));
}

function relu (z){
  //returns max(0,z)
  return (z + Math.abs(z))/2;
}