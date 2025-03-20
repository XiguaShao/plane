import * as _ from 'lodash';
import Weapon from './Weapon';

const { ccclass } = cc._decorator;

@ccclass
export default class FanWeapon extends Weapon {

    protected async _fire(dt?: number): Promise<void> {
        if (dt) {
            this._duration += dt;
        }
         if (this.fireCount !== 0 && this._count++ >= this.fireCount) {
             this.unschedule(this._fire);
             if (this.plane.onWeaponRemove) {
                 this.plane.onWeaponRemove();
                 this.node.removeComponent(this);
             }
             return;
         }

        const rotations = this.getRotations();
        for (const rotation of rotations) {
            const bullet = await this._createBullet();
            if (bullet) {
                bullet.node.angle = -rotation;
                bullet.node.zIndex = Math.abs(bullet.node.angle);
                bullet.run(this.plane, this);
            }
        }
    }

    getRotations() {
        let rotations = [];
        const startRotation = -this.rotation * (this.count - 1) / 2;
        for (let i = 0; i < this.count; i++) {
            rotations.push(startRotation + i * this.rotation);
        }
        return rotations
    }

    // protected async _fire(dt):  Promise<void> {
    //     if (!this.plane) {
    //         cc.log('请设置武器的plane属性');
    //         return;
    //     }
    //     const startRotation = -this.rotation * (this.count - 1) / 2;
    //     _.forEach(_.range(0, this.count), async (index) => {
    //         const bullet = await this._createBullet();
    //         if (bullet && bullet.node) {
    //             let curRotation = startRotation + index * this.rotation;
    //             bullet.node.angle = -curRotation;
    //             bullet.node.zIndex = Math.abs(bullet.node.angle);
    //             bullet.run(this.plane, this);
    //         }
    //     });
    // }
}