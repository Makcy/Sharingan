const config = require('./config');
const util = require('./util');

cc.Class({
    extends: cc.Component,

    properties: {
        startBtn: {
            default: null,
            type: cc.Button
        },
        rankBtn: {
            default: null,
            type: cc.Button
        }
    },
    onLoad () {
        if (cc.sys.os != cc.sys.OS_OSX) {
            wx.showShareMenu();
            cc.loader.loadRes('texture/share',(err, data) => {
                wx.onShareAppMessage(() => {
                    return {
                        title: config.shareText[parseInt(Math.random()*config.shareText.length,10)],
                        imageUrl: data.url
                    }
                });
            })
        }
        util.playBtnAudioClip([
            this.startBtn,
            this.rankBtn
        ]);
    },
    start () {
        this.startBtn.node.on('click', this.startBtnCallback, this);
        // this.rankBtn.node.on('click', this.helpBtnCallback, this);
    },
    startBtnCallback() {
        cc.director.loadScene('start');
    },
    // 排行榜
    // rankBtnCallback() {
    // }
});
