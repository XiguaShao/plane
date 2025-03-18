import { PropCfg } from "../common/JsonConfig";
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
        this.duration = this.config && this.config.applyEffect && (this.config.applyEffect as any).duration;
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
    // 武器类数组
    private weaponCtors: typeof Weapon[] = [];
    // 使用WeakMap自动管理内存
    private originalWeaponsMap = new WeakMap<PlayerPlane, Weapon[]>();
    
    
    /**
     * 设置武器配置
     * @param weapons 武器类数组（必须继承Weapon）
     * @param duration 持续时间（秒）
     */
    setWeapons(weapons: typeof Weapon[]): void {
        this.weaponCtors = weapons;
    }

    apply(plane: PlayerPlane) {
        if (this.weaponCtors.length === 0) {
            cc.warn("未配置替换武器，请先调用setWeapons方法");
            return;
        }
        this.applyEffect(
            plane,
            'weapon-swap',
            this.duration,
            () => {
                // 存储到WeakMap
                this.originalWeaponsMap.set(plane, plane.node.getComponents(Weapon));
                // 禁用原始武器
                plane.node.getComponents(Weapon).forEach(weapon => {
                    weapon.enabled = false;
                });

                // 添加新武器组件
                this.weaponCtors.forEach(WeaponClass => {
                    const weapon = plane.node.addComponent(WeaponClass);
                    weapon.enabled = true;
                    weapon.node.active = true;
                });
                
                this.emitEvent('weapon-swap-start', plane.node, this.duration);
            },
            () => {
                // 从WeakMap获取备份
                const originalWeapons = this.originalWeaponsMap.get(plane) || [];
                
                // 移除临时武器
                plane.node.getComponents(Weapon).forEach(weapon => {
                    if (!originalWeapons.includes(weapon)) {
                        weapon.destroy();
                    }
                });

                // 恢复原始武器
                originalWeapons.forEach(weapon => {
                    weapon.enabled = true;
                });

                // 清理缓存
                this.originalWeaponsMap.delete(plane);
                
                this.emitEvent('weapon-swap-end', plane.node);
            }
        );
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