module.exports = {
  formatNumberToTime (timeNumber, length = 4) {
    const repeat = (str, n) => {
      return new Array(n+1).join(str);
    }
    let timeString = timeNumber.toString();
    if (timeString.length < length) {
      timeString = repeat('0', (length - timeString.length)) + timeNumber;
    } 
    return timeString.slice(0, 2) + ':' + timeString.slice(2);
  }
}