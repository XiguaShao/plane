const { ccclass, property } = cc._decorator;

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

    @property
    damageCooldown: number = 0.5; // 伤害冷却时间（秒）

    private _maxHP!: number;
    private _progressBar!: cc.ProgressBar;
    private _lastDamageTime: number = 0; // 上次受伤时间







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

    /**
     * 受到伤害
     * @param damage 伤害值
     * @returns 是否成功造成伤害
     */
    takeDamage(damage: number): boolean {
        const now = cc.director.getTotalTime() / 1000; // 转换为秒
        if (now - this._lastDamageTime < this.damageCooldown) {
            return false; // 在冷却时间内，不受伤害
        }

        const actualDamage = Math.max(1, damage - this.defense);
        this.hp -= actualDamage;
        this._lastDamageTime = now;

        // 显示血条
        if (this._progressBar) {
            this._progressBar.node.opacity = 255;
            this.unschedule(this._hideProgressBar);
            this.scheduleOnce(this._hideProgressBar, 1);
        }

        if (this.hp <= 0) {
            this._playDestroy();
        }

        return true;
    }

    private _hideProgressBar(): void {
        if (this._progressBar) {
            this._progressBar.node.opacity = 0;
        }
    }
}