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
    start () {
        this.startBtn.node.on('click', this.startBtnCallback, this);
        this.rankBtn.node.on('click', this.helpBtnCallback, this);
    },
    startBtnCallback() {
        cc.director.loadScene('start');
    },
    rankBtnCallback() {
    }
});
