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
        failedNode: {
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
        resurgenceBtn: {
            default: null,
            type: cc.Button
        },
        continueBtn: {
            default: null,
            type: cc.Button
        },
        stageLabel: {
            default: null,
            type: cc.Label
        },
        gradeLable: {
            default: null,
            type: cc.Label
        },
        failedGradeLabel: {
            default: null,
            type: cc.Label
        },
        failedTipLabel: {
            default: null,
            type: cc.Label
        },
        startBtnSprite: {
            default: null,
            type: cc.SpriteFrame
        },
        stopBtnSprite: {
            default: null,
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
        
    // },

    start () {
        this.isStopBtn = true;
        this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        this.setConditionTip();
        this.setStageTip();
        this.stopBtn.node.on('click', this.stopBtnCallback, this);
        this.nextBtn.node.on('click', this.nextBtnCallback, this);
        this.resurgenceBtn.node.on('click', this.resurgenceBtnCallback, this);
        this.continueBtn.node.on('click', this.continueBtnCallback, this);
    },
    update (dt) {
        if (!this.isStopBtn) {
            this.timeValue += 2;
            this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        }
    },
    stopBtnCallback (event) {
        this.isStopBtn = !this.isStopBtn;
        this.stopBtn.getComponent(cc.Sprite).spriteFrame = this.isStopBtn ? this.startBtnSprite : this.stopBtnSprite;
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
        this.timeLabel.string = util.formatNumberToTime(this.timeValue);
    },
    resurgenceBtnCallback(event) {
        // 诱导分享
        this.resurgence();
    },
    continueBtnCallback(event) {
        this.stage = 1;
        this.resurgence();
    },
    setConditionTip() {
        const stageConfig = this.getStageConfig();
        this.conditionLable.string = stageConfig.from === stageConfig.to ? 
             `规则：按到${util.formatNumberToTime(stageConfig.from)}算你赢` :
             `规则：按到${util.formatNumberToTime(stageConfig.from)}~${util.formatNumberToTime(stageConfig.to)}算你赢`
    },
    setStageTip() {
        this.stageLabel.string = `第 ${this.stage} 关 ${this.getStageConfig().successRate}%用户能闯关通过`;
    },
    getStageConfig() {
        if (this.stage <= 5) {
            return config.stageConfig[this.stage - 1];
        } 
        return {from: 1000, to: 1000, successRate: this.stage < 10 ? (1 - this.stage * 0.1).toFixed(2) :  0.01};
    },
    gameSuccess() {
        this.resetMainGameNode(false);
        this.passNode.active = true;
        this.gradeLable.string = `本次成绩：${util.formatNumberToTime(this.timeValue)}`;
        this.stage += 1;
    },
    gameFail() {
        this.resetMainGameNode(false);
        const stageConfig = this.getStageConfig();
        const diffValue = Math.min(Math.abs(this.timeValue - stageConfig.to), Math.abs(this.timeValue - stageConfig.from));
        this.failedNode.active = true;
        this.failedGradeLabel.string = `本次成绩 ${util.formatNumberToTime(this.timeValue)}`;
        this.failedTipLabel.string = `离目标只有 ${(diffValue / 100).toFixed(2)}啦~`;
        this.timeValue = 0;
    },
    resurgence() {
        this.timeValue = 0;
        this.failedNode.active = false;
        this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        this.resetMainGameNode(true);
    },
    resetMainGameNode(setValue) {
        this.stageLabel.node.active = setValue;
        this.stopBtn.node.active = setValue;
        this.timeLabel.node.active = setValue;
        this.conditionLable.node.active = setValue;
    }
});
