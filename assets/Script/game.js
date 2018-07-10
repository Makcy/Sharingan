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
const config = require('./config');

cc.Class({
    extends: cc.Component,

    properties: {
        stage: {
            default: 1,
            type: cc.Integer
        },
        life: {
            default: 1,
            type: cc.Integer
        },
        passNode: {
          default: null,
          type: cc.Node  
        },
        timeLabel: {
            default: null,
            type: cc.Label
        },
        conditionLable: {
            default: null,
            type: cc.Label
        },
        isStopBtn: {
            default: true
        },
        timeValue: {
            default: 0,
            type: cc.Integer
        },
        stopBtn: {
            default: null,
            type: cc.Button
        },
        nextBtn: {
            default: null,
            type: cc.Button
        },
        stageLabel: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.isStopBtn = true;
        this.timeLabel.string = util.formatNumberToTime(this.timeValue, 4);
        this.setConditionTip();
        this.setStageTip();
        this.stopBtn.node.on('click', this.stopBtnCallback, this);
        this.nextBtn.node.on('click', this.nextBtnCallback, this);
    },
    update (dt) {
        if (!this.isStopBtn) {
            this.timeValue += 1;
            this.timeLabel.string = util.formatNumberToTime(this.timeValue, 4);
        }
    },
    stopBtnCallback (event) {
        this.isStopBtn = !this.isStopBtn;
        const labelNode = this.stopBtn.node.getChildByName('Label');
        labelNode.getComponent(cc.Label).string = this.isStopBtn ? '开  始' : '结  束';
        if (this.isStopBtn && this.timeValue != 0) {
            // 闯关逻辑
            const stageConfig = this.getStageConfig();
            if (this.timeValue >= stageConfig.from && this.timeValue <= stageConfig.to) {
                this.gameSuccess();
            } else {
                this.gameFail();
            }
        }
    },
    nextBtnCallback (event) {
        this.resetMainGameNode(true);
        this.passNode.active = false;
        this.timeValue = 0;
        this.setConditionTip();
        this.setStageTip();
        this.timeLabel.string = util.formatNumberToTime(this.timeValue, 4);
    },
    setConditionTip() {
        const stageConfig = this.getStageConfig();
        this.conditionLable.string = stageConfig.from === stageConfig.to ? 
             `闯关条件：时间停留在${util.formatNumberToTime(stageConfig.from)}` :
             `闯关条件：时间停留在${util.formatNumberToTime(stageConfig.from)}于${util.formatNumberToTime(stageConfig.to)}之间`
    },
    setStageTip() {
        this.stageLabel.string = `第 ${this.stage} 关`;
    },
    getStageConfig() {
        if (this.stage <= 5) {
            return config.stageConfig[this.stage];
        } 
        return {from: 1000, to: 1000};
    },
    gameSuccess() {
        this.resetMainGameNode(false);
        this.passNode.active = true;
        this.stage += 1;
    },
    gameFail() {
        this.timeValue = 0;
    },
    resurgence() {
        if (this.life < 1) {
            // Game Over 
        } else {
            this.timeValue = 0;
        }
    },
    resetMainGameNode(setValue) {
        this.stopBtn.node.active = setValue;
        this.timeLabel.node.active = setValue;
        this.conditionLable.node.active = setValue;
    }
});
