import { TimerManager } from '../timer/TimerManager';
import Plane from './Plane';

const { ccclass } = cc._decorator;

@ccclass
export default class PlayerPlane extends Plane {
    /**技能效果 */
    public activeEffects = new Map<string, number>();
    /**无敌*/
    public isInvincible: boolean = false;

    start(): void {
       super.start(); 
       cc.game.emit('player-init', this);
    }

    onCollisionEnter(other: cc.Collider): void {
        if(this.isInvincible) return;
        const bullet = other.getComponent('Bullet');
        if (bullet) {
            this.hp -= bullet.getDamageValue();
        } else {
            const enemyPlane = other.getComponent(Plane);
            if (enemyPlane) {
                this.hp -= enemyPlane.hp;
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