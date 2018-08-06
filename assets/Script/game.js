const util = require('./util');
const config = require('./config');
const successColor = cc.hexToColor("#FFD9BF");
const normalColor = cc.hexToColor("#DEDEDE");
const completeColor = cc.hexToColor("#FFF540");
let stageConfigData = [];
// let isVibrate = false;
// let IntervalID;
// let isPhone = cc.sys.os != cc.sys.OS_OSX || false;

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
        fightAgainBtn: {
            default: null,
            type: cc.Button
        },
        customerBtn: {
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
        },
        backGround: {
            default: null,
            type: cc.Node
        },
        userAvatar: {
            default: null,
            type: cc.Node
        },
        userName: {
            default: null,
            type: cc.Label
        },
        tempResurgenceSprite: {
            default: null,
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        try {
            cc.game.setFrameRate(60);
            if (new Date() > new Date('2018/08/07')) {
                this.resurgenceBtn.getComponent(cc.Sprite).spriteFrame = this.tempResurgenceSprite;
                this.customerBtn.node.active = true;
            }
        } catch (e) {
            console.log(`锁帧出错：${e}`);
        }
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
            this.paradeBtn,
            this.fightAgainBtn,
            this.customerBtn
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
        this.fightAgainBtn.node.on('click', this.fightAgainBtnCallback, this);
        this.customerBtn.node.on('click', this.customerBtnCallback, this);
    },
    update (dt) {
        if (!this.isStopBtn) {
            this.timeValue += 2;
            this.timeLabel.string = util.formatNumberToTime(this.timeValue);
        }
    },
    // lateUpdate (dt) {
    //     if (isPhone) {
    //         if (!this.isStopBtn && !isVibrate) {
    //             isVibrate = this.isStopBtn;
    //             IntervalID = setInterval(this.getVibrate, 240);
    //         } 
    //         if (this.isStopBtn && isVibrate) {
    //             isVibrate = !this.isStopBtn;
    //             clearInterval(IntervalID);
    //         }
    //     }
    // },
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
            // console.info(`停止按钮：${this.stage} ${stageConfig.from}  ${stageConfig.to} ${stageConfig.successRate}`);
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
        // if (cc.sys.os != cc.sys.OS_OSX) {
            // const self = this;
            // cc.loader.loadRes('texture/share',(err, data) => {
            //     wx.shareAppMessage({
            //         title: '我刚通过了全部挑战，你敢来试试吗？',
            //         imageUrl: data.url,
            //         success(res) {
            //             console.log('分享成功');
            //             self.resurgence(true);
            //         },
            //         fail(res) {
            //             console.log('分享失败');
            //         } 
            //     })
            // })
        // }
        this.openCustomerSession();
    },
    customerBtnCallback(event) {
        this.openCustomerSession();
    },
    fightAgainBtnCallback(event) {
        this.resurgence(true);
    },
    setConditionTip() {
        const stageConfig = this.getStageConfig(true);
        // console.info(`闯关条件：${this.stage} ${stageConfig.from}  ${stageConfig.to} ${stageConfig.successRate}`);
        this.conditionLable.string = stageConfig.from === stageConfig.to ? 
             `<color=#435370>按到 </color><color=#11164E><size=80><b>${util.formatNumberToTime(stageConfig.from)}</b></size></color> <color=#435370>通关成功</color>` :
            `<color=#435370>按到 </color><color=#11164E><size=80><b>${util.formatNumberToTime(stageConfig.from)} - ${util.formatNumberToTime(stageConfig.to)}</b></size></color> <color=#435370>进入下一关</color>`
    },
    setStageTip() {
        this.stageLabel.string = this.stage != 5 ?`第 ${this.stage} 关` : '终极挑战';
        // console.info(`通过率：${this.stage} ${this.getStageConfig().successRate}`);
        this.rateLabel.string = `${this.getStageConfig().successRate}%用户能闯关通过`;
    },
    getStageConfig(isRandom = false) {
        if (!isRandom && stageConfigData[this.stage - 1]) {
            return stageConfigData[this.stage - 1];
        }
        const statePayload = config.stageConfig[this.stage - 1];
        let seed = 500;
        if (this.stage < 5) {
            // [3,7]内随机时间 + 差值
            seed = parseInt(Math.random() * 350, 10) + 300;  
        } 
        stageConfigData[this.stage - 1] = {from: seed, to: seed + statePayload.diff, successRate: statePayload.successRate};
        return stageConfigData[this.stage - 1];
    },
    gameSuccess() {
        if (this.stage < 5) {
            this.resetMainGameNode(false);
            this.backGround.color = successColor;
            this.passNode.active = true;
            this.gradeLable.string = `<color=#435370>本次成绩：</color><size=120><color=#11164E>${util.formatNumberToTime(this.timeValue)}</color></size>`;
            this.stage += 1;
        } else {
            this.resetMainGameNode(false);
            this.passNode.active = false;
            this.backGround.color = completeColor;
            this.timeValue = 0;
            this.stage = 1;
            this.setConditionTip();
            this.setStageTip();
            this.timeLabel.string = util.formatNumberToTime(this.timeValue);
            if (cc.sys.os != cc.sys.OS_OSX) {
                this.getUserInfo();
            }
            this.completedNode.active = true;
            this.timeBgAudioId = cc.audioEngine.play(this.winBgAudioClip, false, 1);
        }
    },
    gameFail() {
        this.getVibrate(true);
        this.resetMainGameNode(false);
        const stageConfig = this.getStageConfig();
        // console.info(`游戏失败： ${this.stage} ${stageConfig.from}  ${stageConfig.to} ${stageConfig.successRate}`);
        const diffValue = Math.min(Math.abs(this.timeValue - stageConfig.to), Math.abs(this.timeValue - stageConfig.from));
        this.failedNode.active = true;
        this.failedGradeLabel.string = `<color=#435370>本次成绩：</color><color=#11164E><size=120>${util.formatNumberToTime(this.timeValue)}</size></color>`;
        this.failedTipLabel.string = `<color=#435370>离目标只有</color><size=110><color=#11164E>${(diffValue / 100).toFixed(2)}</color></size><color=#435370>啦~</color>`;
        this.timeValue = 0;
    },
    resurgence(isRestart = false) {
        if (isRestart) {
            this.stage = 1;
            stageConfigData = [];
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
        if (new Date() > new Date('2018/08/07')) {
            this.customerBtn.node.active = setValue;
        }
        this.backGround.color = normalColor;
        this.stageLabel.node.active = setValue;
        this.stopBtn.node.active = setValue;
        this.timeLabel.node.active = setValue;
        this.conditionLable.node.active = setValue;
        this.rateLabel.node.active = setValue;
    },
    getUserInfo() {
        const self = this;
        wx.getUserInfo({
            success: function (res) {
                const { avatarUrl, nickName } = res.userInfo;
                if (avatarUrl && nickName) {
                    self.userName.string = nickName;
                    cc.loader.load({url: avatarUrl, type: 'png'}, (err, data) => {
                        if (!err) {
                            const frame = new cc.SpriteFrame(data);
                            self.userAvatar.getComponent(cc.Sprite).spriteFrame = frame;
                        }
                    });
                }
            }
        })
    },
    openCustomerSession() {
        if (cc.sys.os != cc.sys.OS_OSX) {
            wx.openCustomerServiceConversation({});
        }
    },
    getVibrate(isLong = false) {
        if (cc.sys.os != cc.sys.OS_OSX) {
            try {
                if (isLong) {
                    wx.vibrateLong({});
                } else {
                    wx.vibrateShort({});
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
});
