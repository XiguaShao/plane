import Plane from './Plane';

const { ccclass } = cc._decorator;

@ccclass
export default class PlayerPlane extends Plane {
    onLoad(): void {
    }

    protected _updateHp(): void {
    }

    onCollisionEnter(other: cc.Collider): void {
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
}