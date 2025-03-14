import * as _ from 'lodash';
import Weapon from './Weapon';

const { ccclass } = cc._decorator;

@ccclass
export default class FanWeapon extends Weapon {
    protected async _fire(dt?: number): Promise<void> {
        if (dt) {
            this._duration += dt;
        }
        if (this.count !== 0 && this._count++ >= this.count) {
            this.unschedule(this._fire);
            if (this.plane.onWeaponRemove) {
                this.plane.onWeaponRemove();
                this.node.removeComponent(this);
            }
            return;
        }

        const rotations = this._getRotations();
        for (const rotation of rotations) {
            this.rotation = rotation;
            const bullet = await this._createBullet();
            if (bullet) {
                bullet.run(this.plane, this);
            }
        }
    }
}