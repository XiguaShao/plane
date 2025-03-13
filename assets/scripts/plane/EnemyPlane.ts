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
            // this._playDestroy();
            this.takeDamage(2);
            if (this.hp > 0) {
                this._progressBar.node.runAction(cc.fadeOut(1));
            }
        } else {
            //碰到玩家子弹
            this._progressBar.node.opacity = 255;
            const bullet = other.getComponent('Bullet');
            this.takeDamage(bullet.getDamageValue())
            // this.hp -= bullet.getDamageValue();
            if (this.hp > 0) {
                this._progressBar.node.runAction(cc.fadeOut(1));
            }
        }
    }


    @property({
        type: [cc.Float],
        tooltip: "对应物品的掉落概率 (0-100)",
        range: [0, 100],
        slide: true,
        step: 1
    })
    dropRates: number[] = [];

    protected _playDestroy(): void {
        cc.game.emit('enemy-plane-destroy', this);
        
        // 掉落物品
        if (this.dropItems.length) {
            const random = Math.random() * 100; // 随机值 0-100
            let currentSum = 0;
            let bDrop = false;
            // 根据概率选择道具
            for (let i = 0; i < this.dropItems.length; i++) {
                currentSum += this.dropRates[i] || 0;
                if (random <= currentSum && random > (currentSum - this.dropRates[i])) {
                    // 生成选中的道具
                    const node = cc.instantiate(this.dropItems[i]);
                    node.parent = this.node.parent;
                    node.position = this.node.position;

                    const p = cc.v2(node.x + (Math.random() > 0.5 ? -50 : 50), node.y);
                    const array = [
                        cc.v2(node.x, node.y + 100),
                        cc.v2(p.x, p.y + 100),
                        p,
                    ];
                    const jumpBy = cc.bezierTo(0.4, array).easing(cc.easeSineOut());

                    const y = -cc.winSize.height / 2 - p.y;
                    const duration = Math.abs(y / (60 + Math.random() * 40));
                    const moveTo = cc.moveTo(duration, cc.v2(p.x, y)).easing(cc.easeSineOut());
                    const removeSelf = cc.removeSelf();
                    node.runAction(cc.sequence(jumpBy, moveTo, removeSelf));
                    bDrop = true;
                    break;
                }
            }
            if(!bDrop) {
                console.log("掉落未命中")
            }
        }

        super._playDestroy();
    }
}