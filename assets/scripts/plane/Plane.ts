import ResourceManager from "../../framework/resourceManager/ResourceManager";
import { AccountlvCfg, PlaneCfg } from "../common/JsonConfig";
import { TempConfig } from "../common/ResConst";
import { PLAYER_DATE_TYPE } from "../data/GamePlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Plane extends cc.Component {
    public static EventTarget: cc.EventTarget = new cc.EventTarget();

    @property
    _hp: number = 1;

    @property({
        type: cc.Integer, visible: true
    })
    set hp(value: number) {
        this._hp = value;
        this.updateHp();
    }

    get hp(): number {
        return this._hp;
    }

    @property
    defense: number = 0; //防御

    @property
    damageCooldown: number = 0.5; // 伤害冷却时间（秒）

    /**id */
    private _id: number = null;
    /**名字 */
    private _name: string = null;
    /**介绍 */
    private _intro: string = null;
    /**资产 */
    private _asset: string = null;
    /**掉落 */
    private _dropItems: number[] = [];
    /**掉落比例*/
    private _dropItemRates: number[] = [];
    /**武器 */
    private _weapons: number[] = [];
    /**最大血量 */
    public _maxHP!: number;
    public _progressBar!: cc.ProgressBar;
    private _lastDamageTime: number = 0; // 上次受伤时间

    /**飞机等级 */
    public level: number = 0;
    /**飞机自身的伤害 */
    public attack: number = 0; 

    /**配置表 */
    public planeCfg: PlaneCfg = null;

    start(): void {
        this._maxHP = this.hp;
        const node = this.node.getChildByName('progressBar');

        if (node) {
            node.opacity = 0;
            const progressBar = node.getComponent(cc.ProgressBar);
            this._progressBar = progressBar;
            this._progressBar.progress = this.hp / this._maxHP;
        }
        this.registerEvent();
    }

    /**
     * @description:注册事件
     */
    registerEvent(){
    }

    /**
     * @description:初始化
     */
    gameInit(){}

    /**
     * @description:升级经验
     */
    roleExpExchange(){}

    /**
     * @description: 初始化配置
     * @param cfg 
     */
    initByCfg(cfg: PlaneCfg) {
        this.planeCfg = cfg;
        this._id = cfg.id;
        this.name = cfg.name;
        this.hp = cfg.hp;
        this.defense = cfg.defense;
        this._intro = cfg.introduce;
        this._asset = cfg.asset;
        this._weapons = cfg.weapons;
        this._dropItems = cfg.dropItems;
        this._dropItemRates = cfg.dropItemRates;
    }

    /**
     * @description: 更新血量
     */
    updateHp(): void {
        if (this._progressBar) {
            this._progressBar.progress = this.hp / this._maxHP;
        }
    }

    /**
     * @description: 获取最大血量
     * @returns 
     */
    getMaxHP(): number {
        return this._maxHP;
    }

    /**
     * @description:获取掉落道具id
     * @returns 
     */
    getDropItems(): number[] {
        return this._dropItems;
    }

    /**
     * @description:获取掉落的比例
     * @returns 
     */
    getDropItemRates(): number[] {
        return this._dropItemRates;
    }

    /**
     * @description:获取挂载的武器
     * @returns 
     */
    getWeapons(): number[] {
        return this._weapons;
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
        const spawn = cc.spawn(fadeOut, scaleTo, cc.callFunc(() => {
            this.createBomb();
        }));
        //击落
        const callFunc = cc.callFunc(() => {
            this.node.emit('shoot-down', this);
        });
        const remove = cc.removeSelf();
        this.node.runAction(cc.sequence(spawn, callFunc, remove));
    }

    /**
     * @desc:移除武器
     */
    onWeaponRemove() {

    }

    /**
     * 受到伤害
     * @param damage 伤害值
     * @returns 是否成功造成伤害
     */
    takeDamage(damage: number): boolean {
        const now = cc.director.getTotalTime() / 1000; // 转换为秒
        // if (now - this._lastDamageTime < this.damageCooldown) {
        //     return false; // 在冷却时间内，不受伤害
        // }

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
            this.hp = 0
            this._playDestroy();
        }

        return true;
    }

    private _hideProgressBar(): void {
        if (this._progressBar) {
            this._progressBar.node.opacity = 0;
        }
    }

    /**
     * @description: 创建爆炸特效
     */
    async createBomb() {
        let bombNode = await App.nodePoolMgr.getNodeFromPool("bombEffect1", "prefabs/effect/BombEffect1");
        bombNode.parent = App.gameGlobal.effectLayer;
        bombNode.setPosition(this.node.position);
    }

}