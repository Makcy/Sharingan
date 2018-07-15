module.exports = {
  formatNumberToTime (timeNumber, length = 4) {
    const repeat = (str, n) => {
      return new Array(n+1).join(str);
    }
    let timeString = timeNumber.toString();
    if (timeString.length < length) {
      timeString = repeat('0', (length - timeString.length)) + timeNumber;
    } 
    return timeString.slice(0, 2) + '.' + timeString.slice(2);
  },
  playBtnAudioClip (btns) {
    const onTouchDown = (event) => {
        cc.loader.loadRes('audio/btn',(err, data) => {
            cc.audioEngine.play(data, false, 0.5);
        });
    }
    btns.map(b => {
        b.node.on('touchstart', onTouchDown, b.node);
    })
  }
}