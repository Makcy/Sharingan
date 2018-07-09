// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const util = require('./util');
cc.Class({
    extends: cc.Component,

    properties: {
        timeLabel: {
            default: null,
            type: cc.Label
        },

        isStopBtn: {
            default: true,
            type: Boolean
        },

        timeValue: {
            default: 0,
            type: Number
        },
        stopBtn: {
            default: null,
            type: cc.Button
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.isStopBtn = true;
        this.timeLabel.string = util.formatNumberToTime(this.timeValue, 4);
        this.stopBtn.node.on('click', this.stopBtnCallback, this);
    },

    update (dt) {
        if (!this.isStopBtn) {
            this.timeValue += 1;
            this.timeLabel.string = util.formatNumberToTime(this.timeValue, 4);
        }
    },

    stopBtnCallback (event) {
        this.isStopBtn = !this.isStopBtn;
    }
});
