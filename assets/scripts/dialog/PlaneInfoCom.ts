/**
 * @ClassName: PlaneInfoCom
 * @Desc: 飞机详情信息
 * @Author: godGhost
 * @Date: 2025-03-18 14:56:02
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlaneInfoCom extends cc.Component {
    /** 等级按钮 */
    // @property({ type: cc.Node, tooltip: CC_DEV && "等级按钮" })
    // nodeBtnLvL: cc.Node = null;
    /** 玩家飞机属性节点 */
    @property({ type: cc.Node, tooltip: CC_DEV && "玩家飞机属性节点" })
    nodeDetail: cc.Node = null;
    /** 飞机模型 */
    @property({ type: cc.Sprite, tooltip: CC_DEV && "飞机模型" })
    spPlane: cc.Sprite = null;
    /** 玩家等级 */
    @property({ type: cc.Label, tooltip: CC_DEV && "玩家等级" })
    lbLevel: cc.Label = null;
    /** 经验进度条 */
    @property({ type: cc.ProgressBar, tooltip: CC_DEV && "经验进度条" })
    lvProgress: cc.ProgressBar = null;
    /** 当前攻击属性 */
    @property({ type: cc.Label, tooltip: CC_DEV && "当前攻击属性" })
    lbCurAtk: cc.Label = null;
    /** 当前血量属性 */
    @property({ type: cc.Label, tooltip: CC_DEV && "当前攻击属性" })
    lbCurHp: cc.Label = null;
    /** 下级攻击属性 */
    @property({ type: cc.Label, tooltip: CC_DEV && "当前攻击属性" })
    lbNextAtk: cc.Label = null;
    /** 下级血量属性 */
    @property({ type: cc.Label, tooltip: CC_DEV && "当前攻击属性" })
    lbNextHp: cc.Label = null;


    protected start(): void {
        this.initUI();
    }

    /**
     * @Method: initUI
     * @Desc: 界面初始化
     */
    initUI() {
        /** 飞机模型展示 */
        // this.spPlane
        /** 飞机等级 */
        this.lbLevel.string = `Lv.${3}`;
        /** 经验进度 */
        this.lvProgress.progress = 80 / 100;
        /** 当前攻击 */
        this.lbCurAtk.string = `当前攻击：${2}`;
        /** 当前生命值 */
        this.lbCurHp.string = `当前生命：${4}`;
        /** 下级攻击 */
        this.lbNextAtk.string = `下级攻击：${4}`;
        /** 下级生命值 */
        this.lbNextHp.string = `下级生命：${6}`;

    }

    /**
     * @Method: onClickDetail
     * @Desc: 点击查看飞机详情
     */
    onClickDetail() {
        this.nodeDetail.active = true;
    }

    /**
     * @Method: onClickClose
     * @Desc: 点击关闭
     */
    onClickClose() {
        this.nodeDetail.active = false;
    }
}
