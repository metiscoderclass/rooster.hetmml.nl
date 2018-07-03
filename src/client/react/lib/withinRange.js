export default function withinRange(number, rangeMax) {
  if (number < 0) {
    return withinRange(number + (rangeMax + 1), rangeMax);
  }

  if (number > rangeMax) {
    return withinRange(number - (rangeMax + 1), rangeMax);
  }

  return number;
}
