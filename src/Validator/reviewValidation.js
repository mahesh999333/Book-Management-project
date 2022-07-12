
//function for ratinhg verification
const isValidRating = function(rating){
    return  /^([1-4]+\.?[0-9]*|[5]?)$/.test(rating); 
  };

module.exports = {isValidRating}