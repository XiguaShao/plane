import Plane from '../plane/Plane';
import Bullet from '../bullet/Bullet';
import Weapon from './Weapon';

const { ccclass, property } = cc._decorator;

@ccclass
export default class LaserWeapon extends Weapon {
   
    public followX: boolean = false;

    public bullet:Bullet = null;

    async start() {
        this.plane = this.node.getComponent(Plane);
        if (!this.plane) {
            return;
        }
        this.bullet = await this._createBullet()
    }

    protected async _fire(dt?: number) {
    }

    protected update(dt: number): void {
        if (!this.plane || !this.bullet) return;
        if(this.followX){
            this.bullet.node.x = this.plane.node.x;
        }else{
            this.bullet.node.y = this.plane.node.y;
        }
    }

}