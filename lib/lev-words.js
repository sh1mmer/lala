// Compute the edit distance between the two given strings

wordDist = exports.wordDist = function(a, b) {
  //remove all punctuation
  a = a.replace(/[^a-zA-Z\d]/g, " ")
  b = b.replace(/[^a-zA-Z\d]/g, " ")

  //squash spaces down to single space
  a = a.replace(/ +/g, " ")
  b = b.replace(/ +/g, " ")

  a = a.split(" ")
  b = b.split(" ")

  var dist = getDistance(a, b)

  //console.log("%: " + Math.round(((a.length - dist) / a.length)*100))
  //return dist
  //return pc for now
  if(a.length<b.length) { 
    var per = Math.floor(((a.length - dist)/a.length)*100) 
  } else {
    var per = Math.floor(((b.length - dist)/b.length)*100)
  }
  return per 
}

exports.charDist = function(a, b) {
  return getDistance(a.split(""), b.split(""))
}

function getDistance(a, b){
  if(a.length == 0) return b.length; 
  if(b.length == 0) return a.length; 

  var matrix = [];

  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }

  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b[i-1] == a[j-1]){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }

  return matrix[b.length][a.length];
};
