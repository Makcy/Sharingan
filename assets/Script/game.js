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
        timeBgAudioClip: {
            default: null,
            url: cc.AudioClip
        },
        winBgAudioClip: {
            default: null,
            url: cc.AudioClip
        },
        timeBgAudioId: {
            default: -1,
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
        completedNode: {
            default: null,
            type: cc.Node
        },
        timeLabel: {
            default: null,
            type: cc.Label
        },
        conditionLable: {
            default: null,
            type: cc.RichText
        },
        rateLabel: {
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
        paradeBtn: {
            default: null,
            type: cc.Button
        },
        stageLabel: {
            default: null,
            type: cc.Label
        },
        gradeLable: {
            default: null,
            type: cc.RichText
        },
        failedGradeLabel: {
            default: null,
            type: cc.RichText
        },
        failedTipLabel: {
            default: null,
            type: cc.RichText
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
            this.stopBtn,
            this.nextBtn,
            this.resurgenceBtn,
            this.continueBtn,
            this.paradeBtn
        ]);
    },

    start () {
        this.isStopBtn = true;
        this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        this.setConditionTip();
        this.setStageTip();
        this.stopBtn.node.on('click', this.stopBtnCallback, this);
        this.nextBtn.node.on('click', this.nextBtnCallback, this);
        this.resurgenceBtn.node.on('click', this.resurgenceBtnCallback, this);
        this.continueBtn.node.on('click', this.continueBtnCallback, this);
        this.paradeBtn.node.on('click', this.paradeBtnCallback, this);
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
        if (this.isStopBtn) {
            cc.audioEngine.pause(this.timeBgAudioId);
        } else {
            if (this.timeBgAudioId != -1) {
                this.timeBgAudioId = cc.audioEngine.play(this.timeBgAudioClip, true, 1);
            } else {
                cc.audioEngine.resume(this.timeBgAudioId);
            }
        }
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
        this.passNode.active = false;
        this.timeValue = 0;
        this.setConditionTip();
        this.setStageTip();
        this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        this.resetMainGameNode(true);
    },
    resurgenceBtnCallback(event) {
        // 诱导分享
        if (cc.sys.os != cc.sys.OS_OSX) {
            const self = this;
            cc.loader.loadRes('texture/share',(err, data) => {
                wx.shareAppMessage({
                    title: config.shareText[parseInt(Math.random()*config.shareText.length,10)],
                    imageUrl: data.url,
                    success(res) {
                        self.resurgence();
                    },
                    fail(res) {
                        console.log('分享失败');
                    } 
                })
            })
        }
    },
    continueBtnCallback(event) {
        this.resurgence(true);
    },
    paradeBtnCallback(event) {
        // 诱导分享
        if (cc.sys.os != cc.sys.OS_OSX) {
            const self = this;
            cc.loader.loadRes('texture/share',(err, data) => {
                wx.shareAppMessage({
                    title: '我刚通过了全部挑战，你敢来试试吗？',
                    imageUrl: data.url,
                    success(res) {
                        console.log('分享成功');
                        self.resurgence(true);
                    },
                    fail(res) {
                        console.log('分享失败');
                    } 
                })
            })
        }
    },
    setConditionTip() {
        const stageConfig = this.getStageConfig();
        this.conditionLable.string = stageConfig.from === stageConfig.to ? 
             `按到 <size=94>${util.formatNumberToTime(stageConfig.from)}</size> 通关成功` :
             `按到 <size=94>${util.formatNumberToTime(stageConfig.from)} - ${util.formatNumberToTime(stageConfig.to)}</size> 通关成功`
    },
    setStageTip() {
        // this.stageLabel.string = `第 ${this.stage} 关 ${this.getStageConfig().successRate}%用户能闯关通过`;
        this.stageLabel.string = `第 ${this.stage} 关`;
        this.rateLabel.string = `${this.getStageConfig().successRate}%用户能闯关通过`;
    },
    getStageConfig() {
        if (this.stage <= 5) {
            return config.stageConfig[this.stage - 1];
        } 
        return {from: 10, to: 1000, successRate: this.stage < 10 ? (0.01 - this.stage * 0.001).toFixed(2) :  0.01};
    },
    gameSuccess() {
        if (this.stage < 5) {
            this.resetMainGameNode(false);
            this.passNode.active = true;
            this.gradeLable.string = `本次成绩：<size=180>${util.formatNumberToTime(this.timeValue)}</size>`;
            this.stage += 1;
        } else {
            this.resetMainGameNode(false);
            this.passNode.active = false;
            this.timeValue = 0;
            this.stage = 1;
            this.setConditionTip();
            this.setStageTip();
            this.timeLabel.string = util.formatNumberToTime(this.timeValue);
            this.completedNode.active = true;
            this.timeBgAudioId = cc.audioEngine.play(this.winBgAudioClip, false, 1);
        }
    },
    gameFail() {
        this.resetMainGameNode(false);
        const stageConfig = this.getStageConfig();
        const diffValue = Math.min(Math.abs(this.timeValue - stageConfig.to), Math.abs(this.timeValue - stageConfig.from));
        this.failedNode.active = true;
        this.failedGradeLabel.string = `本次成绩 <size=160>${util.formatNumberToTime(this.timeValue)}</size>`;
        this.failedTipLabel.string = `离目标只有 <size=110>${(diffValue / 100).toFixed(2)}</size> 啦~`;
        this.timeValue = 0;
    },
    resurgence(isRestart = false) {
        if (isRestart) {
            this.stage = 1;
        }
        this.timeValue = 0;
        this.completedNode.active = false;
        this.failedNode.active = false;
        this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        this.setConditionTip();
        this.setStageTip();
        this.resetMainGameNode(true);
    },
    resetMainGameNode(setValue) {
        this.stageLabel.node.active = setValue;
        this.stopBtn.node.active = setValue;
        this.timeLabel.node.active = setValue;
        this.conditionLable.node.active = setValue;
        this.rateLabel.node.active = setValue;
    }
});
