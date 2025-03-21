import ResourceManager from '../../framework/resourceManager/ResourceManager';
import { AccountlvCfg } from '../common/JsonConfig';
import { TempConfig } from '../common/ResConst';
import { PLAYER_DATE_TYPE } from '../data/GamePlayerData';
import { TimerManager } from '../timer/TimerManager';
import Weapon from '../weapon/Weapon';
import Plane from './Plane';

const { ccclass } = cc._decorator;

@ccclass
export default class PlayerPlane extends Plane {
    /**技能效果 */
    public activeEffects = new Map<string, number>();
    /**无敌*/
    public isInvincible: boolean = false;
    // 修改为存储组件实例的uuid
    public originalWeaponUUIDs = new Set<string>();

    start(): void {
        cc.game.on('roleExpExchange', this.roleExpExchange, this);
        cc.game.on('game-data-init', this.gameDataInit, this);
        super.start();
        this.backupOriginalWeapons();
    }


    /**
     * @desc:备份初始武器
     */
    private backupOriginalWeapons() {
        const weapons = this.node.getComponents(Weapon);
        this.originalWeaponUUIDs = new Set(
            weapons.map(w => w.uuid)
        );
        console.log("originalWeaponUUIDs", this.originalWeaponUUIDs);
    }

    /**
     * @description:数据初始化
     */
    gameDataInit(){
        let level = App.Rms.getDataByType(PLAYER_DATE_TYPE.roleLv) || 1;
        let curConfig = ResourceManager.ins().getJsonById<AccountlvCfg>(TempConfig.AccountlvCfg, level);
        this.hp = curConfig && curConfig.hp || 6;
        this._maxHP = this.hp;
        cc.game.emit('player-init', this);
    }

    /**
     * @desc:升级经验
     */
    roleExpExchange(){
        let level = App.Rms.getDataByType(PLAYER_DATE_TYPE.roleLv) || 1;
        let curConfig = ResourceManager.ins().getJsonById<AccountlvCfg>(TempConfig.AccountlvCfg, level);
        let prevHP = this.hp;
        this.hp = curConfig && curConfig.hp || 6;
        this._maxHP = this.hp;
        cc.game.emit('hp-update', this.node,prevHP,this.hp);
    }

    onCollisionEnter(other: cc.Collider): void {
        if(this.isInvincible) return;
        const bullet = other.getComponent('Bullet');
        if (bullet) {
            this.hp -= bullet.getDamageValue();
        } else {
            const enemyPlane = other.getComponent(Plane);
            if (enemyPlane) {
                this.hp -= 2;
            }
        }

        if (this.hp <= 0) {
            this._playDestroy();  
        }
        cc.game.emit('player-under-attack', this);
    }

    protected _playDestroy(): void {
        this.activeEffects.forEach((timerId) => {
            TimerManager.instance.removeTimer(timerId);
        });
        super._playDestroy();
    }
}