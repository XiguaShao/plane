import GeneratorPlane from '../plane/GeneratorPlane';
import Plane from '../plane/Plane';

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

    private _score: number = 0;

    start(): void {
        this._score = 0;
        cc.game.on('pass-stage', this._passStage, this);
        cc.game.on('player-under-attack', this._onPlayerUnderAttack, this);
        cc.game.on('enemy-plane-destroy', this._onEnemyPlaneDestroy, this);
        // if (this.passLabel) {
        //     this.passLabel.node.active = false;
        // }
    }

    /**
     * 过关
     */
    private _passStage(generator: GeneratorPlane, wave: any[]): void {
        // if (!this.passLabel) return;
        // this.passLabel.node.active = true;
        // this.passLabel.string = '恭喜过关';

        this.nodeResult.active = true;
        this.nodeResult.getChildByName("passLabel").getComponent(cc.Label).string = `得分：${this._score.toString()}`;
        this.nodeResult.getChildByName("spWin").active = true;
        this.nodeResult.getChildByName("spLose").active = false;
        this.nodeResult.scale = 0.1;
        const scale = cc.scaleTo(0.3, 1).easing(cc.easeBounceOut());
        // const callFunc = cc.callFunc(() => {
        //     if (this.passLabel) {
        //         this.passLabel.node.active = false;
        //         generator.init(wave);
        //     }
        // });
        // const delayTime = cc.delayTime(3);
        this.nodeResult.runAction(scale);
    }

    /**
     * 玩家受伤
     */
    private _onPlayerUnderAttack(playerPlane: Plane): void {
        // if (!this.passLabel) return;

        if (playerPlane.hp <= 0) {
            // this.passLabel.node.active = true;
            // this.passLabel.string = 'GAME OVER';
            // this.passLabel.node.scale = 0.1;

            this.nodeResult.active = true;
            this.nodeResult.getChildByName("passLabel").getComponent(cc.Label).string = `得分：${this._score.toString()}`;
            this.nodeResult.getChildByName("spWin").active = false;
            this.nodeResult.getChildByName("spLose").active = true;
            this.nodeResult.scale = 0.1;
            const scale = cc.scaleTo(0.3, 1).easing(cc.easeBounceOut());
            this.nodeResult.runAction(scale);

            // const callFunc = cc.callFunc(() => {
            //     if (this.passLabel) {
            //         this.passLabel.node.active = false;
            //         cc.game.restart();
            //     }
            // });
            // const delayTime = cc.delayTime(5);
            // this.passLabel.node.runAction(cc.sequence(scale, delayTime, callFunc));
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
        this.planeGenerator.getComponent(GeneratorPlane).startGame();
    }

    /**
     * @Method: onClicKAgain
     * @Desc: 再来一次
     */
    onClicKAgain() {
        this.nodeResult.active = false;
        cc.game.restart();
    }
}