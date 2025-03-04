import * as _ from 'lodash';
import Weapon from './Weapon';

const { ccclass } = cc._decorator;

@ccclass
export default class FanWeapon extends Weapon {
    protected _fire(): void {
        if (!this.plane) {
            cc.log('请设置武器的plane属性');
            return;
        }

        const startRotation = -this.rotation * (this.count - 1) / 2;
        
        _.forEach(_.range(0, this.count), (index) => {
            const bullet = this._createBullet();
            if (bullet && bullet.node) {
                bullet.node.rotation = startRotation + index * this.rotation;
                bullet.node.zIndex = Math.abs(bullet.node.rotation);
                bullet.run(this.plane, this);
            }
        });
    }
}