import ResourceManager from '../../framework/resourceManager/ResourceManager';
import { ChapterCfg } from '../common/JsonConfig';
import { TempConfig } from '../common/ResConst';
import { PLAYER_DATE_TYPE } from '../data/GamePlayerData';
import GeneratorPlane from '../plane/GeneratorPlane';
import Plane from '../plane/Plane';
import PlayerPlane from '../plane/PlayerPlane';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayScene extends cc.Component {
    // @property(cc.Label)
    // passLabel: cc.Label | null = null;

    @property(cc.Label)
    scoreLabel: cc.Label | null = null;

    /** 结算节点 */
    @property({ type: cc.Node, tooltip: CC_DEV && "结算节点" })
    nodeResult: cc.Node = null;
    /** 开始节点 */
    @property({ type: cc.Node, tooltip: CC_DEV && "开始节点" })
    nodeStart: cc.Node = null;
    /** 刷怪 */
    @property({ type: cc.Node, tooltip: CC_DEV && "刷怪" })
    planeGenerator: cc.Node = null;
    /** 血量*/
    @property({ type: cc.Label, tooltip: CC_DEV && "血量" })
    lbHp: cc.Label | null = null;
    /** 结算节点 */
    @property({ type: cc.Node, tooltip: CC_DEV && "分数节点" })
    nodeScore: cc.Node = null;
    /** 血量节点 */
    @property({ type: cc.Node, tooltip: CC_DEV && "分数节点" })
    nodeHp: cc.Node = null;

    /** 子弹层 */
    @property({ type: cc.Node, tooltip: CC_DEV && "子弹层" })
    nodeBulletLayer: cc.Node = null;

    /** 飞机层 */
    @property({ type: cc.Node, tooltip: CC_DEV && "飞机层" })
    nodePlaneLayer: cc.Node = null;

    /** 道具层 */
    @property({ type: cc.Node, tooltip: CC_DEV && "道具层" })
    nodeDropLayer: cc.Node = null;
    
    /** 效果层 */
    @property({ type: cc.Node, tooltip: CC_DEV && "效果层" })
    nodeEffectLayer: cc.Node = null;

    private _score: number = 0;

    @property(cc.Node)
    chapterList: cc.Node = null;    // 章节列表节点

    @property(cc.Prefab)
    chapterItemPrefab: cc.Prefab = null;    // 章节项预制体

    private _currentChapter: number = 1;
    private _unlockChapter: number = 1;
    private _maxChapter: number = 1;
    start(): void {
        App.initGameData();
        this.registLayer();
        this.nodeStart.active = true;
        this._score = 0;
        cc.game.on('pass-stage', this._passStage, this);
        cc.game.on('player-init', this.onPlayerInit, this);
        cc.game.on('player-under-attack', this._onPlayerUnderAttack, this);
        cc.game.on('enemy-plane-destroy', this._onEnemyPlaneDestroy, this);
        cc.game.on('shield-activate', this.onShowShield, this);
        cc.game.on('shield-deactivate', this.onHideShield, this);
        cc.game.on('hp-update', this.onUpdateHP, this);
        this._unlockChapter = App.Rms.getDataByType(PLAYER_DATE_TYPE.chapter);
        this._currentChapter = this._unlockChapter;
        this.initUI();
        this.loadChapter();  // 加载章节配置
    }

    loadChapter() {
        ResourceManager.ins().loadRes(TempConfig.ChapterConfig, cc.JsonAsset, (err, asset) => {
            if (err) {
                cc.error("加载 chapter.json 失败:", err);
                return;
            }
            const chapter = asset.json;
            const chapters: ChapterCfg[] = Object.values(chapter);
            this.chapterList.width = chapters.length*210;
            const percent = this._unlockChapter/ chapters.length;
            this.chapterList.parent.parent.getComponent(cc.ScrollView).scrollToPercentHorizontal(percent)
            // 创建章节列表
            chapters.forEach((chapterCfg, index) => {
                if (!this.chapterItemPrefab || !this.chapterList) return;
                this._maxChapter = Math.max(1, chapterCfg.level);
                const item = cc.instantiate(this.chapterItemPrefab);
                item.parent = this.chapterList;
                item.children[1].active = this._currentChapter === chapterCfg.level;
                // 设置章节信息
                const titleLabel = item.getChildByName('titleLabel').getComponent(cc.Label);
                titleLabel.string = chapterCfg.name;
                const bLock = chapterCfg.level > this._unlockChapter
                item.children[3].active = bLock; 
                // 添加点击事件
                const button = item.getComponent(cc.Button);

                button.node.on('click', () => {
                    this.chapterList.children.forEach(element => {
                        element.children[1].active = false;
                    });
                    item.children[1].active = true;
                    if(bLock) return;
                    this._currentChapter = chapterCfg.level;
                }, this);
            });

            
        });
    }

    /**
     * @description:注册层级
     */
    registLayer() {
        App.gameGlobal.planeLayer = this.nodePlaneLayer;
        App.gameGlobal.bulletLayer = this.nodeBulletLayer;
        App.gameGlobal.dropLayer = this.nodeDropLayer;
        App.gameGlobal.effectLayer = this.nodeEffectLayer;
    }

    /**
     * @description:初始化UI
     */
    initUI(){
         this.nodeScore.active = false;
         this.nodeHp.active = false;
    }

    /**
     * 过关
     */
    private _passStage(generator: GeneratorPlane, wave: any[]): void {
        this.nodeResult.active = true;
        this.nodeResult.getChildByName("passLabel").getComponent(cc.Label).string = `得分：${this._score.toString()}`;
        this.nodeResult.getChildByName("spWin").active = true;
        this.nodeResult.getChildByName("spLose").active = false;
        this.nodeResult.scale = 0.1;
        const scale = cc.scaleTo(0.3, 1).easing(cc.easeBounceOut());
        this.nodeResult.runAction(scale);
        // 存储数据
        const nChapter = App.Rms.getDataByType(PLAYER_DATE_TYPE.chapter);
        if(this._currentChapter >= nChapter) {
            App.Rms.updateDataByType(PLAYER_DATE_TYPE.chapter, Math.min(nChapter + 1, this._maxChapter));
        }
    }

    /**
     * 玩家受伤
     */
    private _onPlayerUnderAttack(playerPlane: Plane): void {
        if (playerPlane.hp <= 0) {
            this.nodeResult.active = true;
            this.nodeResult.getChildByName("passLabel").getComponent(cc.Label).string = `得分：${this._score.toString()}`;
            this.nodeResult.getChildByName("spWin").active = false;
            this.nodeResult.getChildByName("spLose").active = true;
            this.nodeResult.scale = 0.1;
            const scale = cc.scaleTo(0.3, 1).easing(cc.easeBounceOut());
            this.nodeResult.runAction(scale);
        }
        if (playerPlane) {
            this.lbHp && (this.lbHp.string = playerPlane.hp.toString());
        }
    }

    private _onEnemyPlaneDestroy(plane: Plane): void {
        if (!this.scoreLabel) return;

        this._score += plane.getMaxHP() * 100;
        this.scoreLabel.string = this._score.toString();
        const scaleBy1 = cc.scaleTo(0.05, 1.1);
        const scaleBy2 = cc.scaleTo(0.05, 1);
        this.scoreLabel.node.runAction(cc.sequence(scaleBy1, scaleBy2));
    }

    /**
     * @Method: onClickStart
     * @Desc: 点击开始游戏
     */
    onClickStart() {
        this.nodeStart.active = false;
        this.planeGenerator.getComponent(GeneratorPlane).startGame(this._currentChapter);
        this.nodeScore.active = true;
        this.nodeHp.active = true;
    }

    /**
     * @Method: onClicKAgain
     * @Desc: 再来一次
     */
    onClicKAgain() {
        this.nodeResult.active = false;
        // Clear all event listeners first
        cc.game.off('pass-stage', this._passStage, this);
        cc.game.off('player-under-attack', this._onPlayerUnderAttack, this);
        cc.game.off('enemy-plane-destroy', this._onEnemyPlaneDestroy, this);
        
        // Reset score
        this._score = 0;
        if (this.scoreLabel) {
            this.scoreLabel.string = '0';
        }
        
        // Restart the game
        cc.director.loadScene('PlayScene');
    }

     /**
     * @description:显示护盾
     * @param planeNode 
     */
     onShowShield(planeNode: cc.Node) {
        planeNode.getChildByName("hudun").active = true;
    }
    /**
     * @description
     * @param planeNode 
     */
    onHideShield(planeNode: cc.Node) {
        planeNode.getChildByName("hudun").active = false;
    }

    /**
     * @desc:玩家初始化
     */
    onPlayerInit(playerPlane: Plane) {
        if (playerPlane) {
            this.lbHp && (this.lbHp.string = playerPlane.hp.toString());
        }
    }

    /**
     * @description:更新血量
     * @param planeNode 
     * @param prevHP 
     * @param curHp 
     */
    onUpdateHP(planeNode: cc.Node, prevHP: number, curHp: number) {
        let hpNode = planeNode.getChildByName("hp");
        if (!hpNode) return;
        this.onPlayerInit(planeNode.getComponent(PlayerPlane));
        hpNode.active = true;
        let anima = hpNode.getComponent(cc.Animation);
        let lbHp = hpNode.getChildByName("lbHp");
        lbHp.getComponent(cc.Label).string = " + " + prevHP.toString();
        // 移除原有complete监听
        anima.off(cc.Animation.EventType.FINISHED); // 先移除旧监听避免重复

        // 添加新的帧事件监听
        anima.on(cc.Animation.EventType.FINISHED, (event: any) => {
            hpNode.active = false;
        });

        if (anima.getAnimationState('hp').isPlaying) {
            return;
        }
        anima.play();
    }
}