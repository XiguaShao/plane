import ResourceManager from "../../framework/resourceManager/ResourceManager";
import { PropCfg, WeaponCfg } from "../common/JsonConfig";
import { TempConfig } from "../common/ResConst";
import PlayerPlane from "../plane/PlayerPlane";
import { TimerManager } from "../timer/TimerManager";
import Weapon from "../weapon/Weapon";

/**
 * 道具策略基类
 */
export abstract class PropStrategy {
    /**掉落配置 */
    protected config: PropCfg = null;

    /**
     * @description:应用策略
     * @param plane
     */
    abstract apply(plane: PlayerPlane): void;

    /**
     * @description:设置配置
     * @param config 
     */
    public setConfig(config:PropCfg){
       this.config = config;
       this.initParam();
    }

    /**
     * @description:初始化参数
     */
    initParam(){}
    
    // 使用Plane类的事件系统
    protected emitEvent<T extends any[]>(eventType: string, ...args: T) {
        cc.game.emit(eventType, ...args);
    }
}

/**
 * 持续型策略基类
 */
abstract class DurationStrategy extends PropStrategy {

    /**持续时间（秒） */
    public duration: number = 5;

    initParam(): void {
        this.duration = this.config && this.config.applyEffect && (this.config.applyEffect as any).duration || this.duration;
    }

    protected applyEffect(
        plane: PlayerPlane,
        effectKey: string,
        duration: number,
        onStart: () => void,
        onEnd: () => void
    ) {
        this.clearEffect(plane, effectKey);
        
        // 提前检查节点有效性
        if (plane && plane.node && !plane.node.isValid) return;

        onStart();
        const timerId = TimerManager.instance.addTimer(
            () => {
                // 增加双重有效性检查
                if (plane && plane.node && !plane.node.isValid) {
                    TimerManager.instance.removeTimer(timerId);
                    return;
                }
                try {
                    onEnd();
                } finally {
                    this.clearEffect(plane, effectKey);
                }
            },
            this.duration * 1000
        );
        plane.activeEffects.set(effectKey, timerId);
    }

    private clearEffect(plane: PlayerPlane, effectKey: string) {
        // 安全访问Map
        if (plane && plane.activeEffects && plane.activeEffects.has(effectKey)) {
            const timerId = plane.activeEffects.get(effectKey)!;
            TimerManager.instance.removeTimer(timerId);
            plane.activeEffects.delete(effectKey);
        }
    }
}

/**
 * 护盾策略
 */
export class ShieldStrategy extends DurationStrategy {

    apply(plane: PlayerPlane) {
        this.applyEffect(
            plane,
            'shield',
            this.duration,
            () => {
                plane.isInvincible = true;
                this.emitEvent('shield-activate', plane.node, this.duration);
            },
            () => {
                plane.isInvincible = false;
                this.emitEvent('shield-deactivate', plane.node);
            }
        );
    }
}

/**
 * 生命恢复策略
 */
export class HealStrategy extends PropStrategy {
    // 治疗量
    public value: number = 1;

    initParam(): void {
        this.value = this.config && this.config.applyEffect && (this.config.applyEffect as any).value;
    }

    apply(plane: PlayerPlane) {
        const prevHP = plane.hp;
        plane.hp = Math.min(plane.hp + this.value, plane.getMaxHP());
        this.emitEvent('hp-update', plane.node, prevHP, plane.hp);
    }
}

/**
 * 武器替换策略
 */
export class WeaponSwapStrategy extends DurationStrategy {
    private weaponIds: number[] = [];

    /**
     * 设置武器配置（带类型校验）
     */
    setWeaponIds(weapons: number[]): void {
        this.weaponIds = weapons;
    }

    apply(plane: PlayerPlane) {
        if (!this.validate(plane)) return;
        
        this.applyEffect(
            plane,
            'weapon-swap',
            this.duration || 5,
            () => this.activateWeapons(plane),
            () => this.restoreWeapons(plane)
        );
    }

    private validate(plane: PlayerPlane): boolean {
        if (!plane || !plane.node || !plane.node.isValid) {
            cc.warn("无效的飞机节点");
            return false;
        }
        if (this.weaponIds.length === 0) {
            cc.warn("请先调用setWeapons方法配置武器");
            return false;
        }
        if (!plane.originalWeaponUUIDs) {
            cc.error("PlayerPlane缺少originalWeaponIds属性");
            return false;
        }
        return true;
    }

    private activateWeapons(plane: PlayerPlane) {
        console.log("激活新武器")
        // 禁用现有武器
        plane.node.getComponents(Weapon).forEach(weapon => {
            weapon.enabled = false /*!plane.originalWeaponUUIDs.has(weapon.uuid)*/;
        });

        this.weaponIds.forEach(weaponId => {
            let comp = plane.node.addComponent(Weapon);
            let weaponCfg = ResourceManager.ins().getJsonById<WeaponCfg>(TempConfig.WeaponConfig, weaponId);
            if (!weaponCfg) {
                console.error("武器表" + weaponId + "没有配置")
                return;
            }
            comp.initByCfg(weaponCfg);
        });

        this.emitEvent('weapon-swap-start', plane.node, this.duration);
    }

    private restoreWeapons(plane: PlayerPlane) {
        console.log("移除新武器，启用原武器")
        // 移除新增武器（通过ID比对）
        plane.node.getComponents(Weapon).forEach(weapon => {
            if (!plane.originalWeaponUUIDs.has(weapon.uuid)) {
                // 使用 cc.tween 来实现延迟销毁，避免使用不存在的 scheduleOnce 方法
                cc.tween(weapon.node)
                  .delay(0)
                  .call(() => weapon.destroy())
                  .start();
            }
        });

        // 启用原始武器
        plane.node.getComponents(Weapon).forEach(weapon => {
            if (plane.originalWeaponUUIDs.has(weapon.uuid)) {
                weapon.enabled = true;
            }
        });

        this.emitEvent('weapon-swap-end', plane.node);
    }

}


// // 攻击力提升策略（持续5秒）
// export class AttackStrategy extends DurationStrategy {
//     apply(plane: PlayerPlane) {
//         const originalAtk = plane.attack;
        
//         this.applyEffect(
//             plane,
//             'attack-buff',
//             5,
//             () => {
//                 plane.attack = originalAtk * 1.5;
//                 this.emitEvent('attack-buff-start', plane.node);
//             },
//             () => {
//                 plane.attack = originalAtk;
//                 this.emitEvent('attack-buff-end', plane.node);
//             }
//         );
//     }
// }