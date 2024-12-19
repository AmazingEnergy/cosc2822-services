module.exports.intersect = (array1, array2) =>
  array1.filter((value) => array2.includes(value));

module.exports.sum = (arr) => arr.reduce((partialSum, a) => partialSum + a, 0);
