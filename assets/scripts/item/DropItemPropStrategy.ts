import { PropCfg } from "../common/JsonConfig";
import PlayerPlane from "../plane/PlayerPlane";
import { TimerManager } from "../timer/TimerManager";

/**
 * 道具策略基类
 */
export abstract class PropStrategy {
    public config: PropCfg = null;
    abstract apply(plane: PlayerPlane): void;
    
    // 使用Plane类的事件系统
    protected emitEvent<T extends any[]>(eventType: string, ...args: T) {
        cc.game.emit(eventType, ...args);
    }
}

/**
 * 持续型策略基类
 */
abstract class DurationStrategy extends PropStrategy {
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
            duration * 1000
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


// 护盾策略（持续5秒）
export class ShieldStrategy extends DurationStrategy {

    apply(plane: PlayerPlane) {
        // 假设 this.config 是一个 PropCfg 类型，并且它有一个 applyEffect 属性
        let duration = this.config && this.config.applyEffect && (this.config.applyEffect as any).duration;
        // 如果 duration 为 undefined，可以设置一个默认值
        if (duration === undefined) {
            duration = 3; // 这里假设默认持续时间为 5 秒
        }
        this.applyEffect(
            plane,
            'shield',
            duration,
            () => {
                plane.isInvincible = true;
                this.emitEvent('shield-activate', plane.node, duration);
            },
            () => {
                plane.isInvincible = false;
                this.emitEvent('shield-deactivate', plane.node);
            }
        );
    }
}

// 治疗策略（立即生效）
export class HealStrategy extends PropStrategy {
    apply(plane: PlayerPlane) {
        let value = this.config && this.config.applyEffect && (this.config.applyEffect as any).value;
        const prevHP = plane.hp;
        plane.hp = Math.min(plane.hp + value, plane.getMaxHP());
        this.emitEvent('hp-update', plane.node, prevHP, plane.hp);
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