import * as _ from 'lodash';
import Plane from './Plane';
import UpdateRotation from '../../scripts/components/UpdateRotation';

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyPlane extends Plane {
    @property([cc.Prefab])
    dropItems: cc.Prefab[] = []; //掉落物品

    onLoad(): void {
        const updateRotation = this.node.addComponent(UpdateRotation);
        updateRotation.offsetRotation = 180;
    }

    /**
     * 碰撞监听
     * @param {cc.Collider} other 
     */
    onCollisionEnter(other: cc.Collider): void {
        if (other.node.group === 'player') {
            //碰到玩家飞机
            this._playDestroy();
        } else {
            //碰到玩家子弹
            this._progressBar.node.opacity = 255;
            const bullet = other.getComponent('Bullet');
            this.hp -= bullet.getDamageValue();
            if (this.hp <= 0) {
                this._playDestroy();  
            } else {
                this._progressBar.node.runAction(cc.fadeOut(1));
            }
        }
    }

    protected _playDestroy(): void {
        cc.game.emit('enemy-plane-destroy', this);
        //掉落物品
        if (this.dropItems.length) {
            const prefab = _.sample(this.dropItems);
            const node = cc.instantiate(prefab);
            node.parent = this.node.parent;
            node.position = this.node.position;

            const p = cc.v2(node.x + _.sample([-50, 50]), node.y);
            const array = [
                cc.v2(node.x, node.y + 100),
                cc.v2(p.x, p.y + 100),
                p,
            ];
            const jumpBy = cc.bezierTo(0.4, array).easing(cc.easeSineOut());

            const y = -cc.winSize.height / 2 - p.y;
            const duration = Math.abs(y / _.random(60, 100));
            const moveTo = cc.moveTo(duration, cc.v2(p.x, y)).easing(cc.easeSineOut());
            const removeSelf = cc.removeSelf();
            node.runAction(cc.sequence(jumpBy, moveTo, removeSelf));
        }

        super._playDestroy();
    }
}