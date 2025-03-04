const { ccclass, property } = cc._decorator;
const _ = require('lodash')

@ccclass
export default class Plane extends cc.Component {
    public static EventTarget: cc.EventTarget = new cc.EventTarget();

    @property
    _hp: number = 1;

    @property({
        type: cc.Integer,visible: true
    })
    set hp(value: number) {
        this._hp = value;
        this._updateHp();
    }

    get hp(): number {
        return this._hp;
    }

    @property
    defense: number = 0; //防御

    private _maxHP!: number;
    public _progressBar!: cc.ProgressBar;







    protected _updateHp(): void {
        if (this._progressBar) {
            this._progressBar.progress = this.hp / this._maxHP;
        }
    }

    start(): void {
        this._maxHP = this.hp;
        const node = this.node.getChildByName('progressBar');
        
        if (node) {
            node.opacity = 0;
            const progressBar = node.getComponent(cc.ProgressBar);
            this._progressBar = progressBar;
            
            this._progressBar.progress = this.hp / this._maxHP;
        }
    }

    getMaxHP(): number {
        return this._maxHP;
    }

    /**
     * 飞机死掉
     */
    protected _playDestroy(): void {
        this.node.stopAllActions();
        //关闭碰撞检测
        const collider = this.node.getComponent(cc.Collider);
        collider.enabled = false;
        //停止武器发射
        const weapons = this.node.getComponents('Weapon');
        weapons.forEach(weapon => weapon.enabled = false);

        const fadeOut = cc.fadeOut(0.5);
        const scaleTo = cc.scaleTo(0.3, 0.1);
        const spawn = cc.spawn(fadeOut, scaleTo);
        //击落
        const callFunc = cc.callFunc(() => {
            this.node.emit('shoot-down', this);
        });
        const remove = cc.removeSelf();
        
        this.node.runAction(cc.sequence(spawn, callFunc, remove));       
    }

    onWeaponRemove() {
        
    }
}