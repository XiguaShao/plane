import Plane from '../plane/Plane';
import Bullet from '../bullet/Bullet';
import Weapon from './Weapon';

const { ccclass, property } = cc._decorator;

@ccclass
export default class LaserWeapon extends Weapon {
   
    public followX: boolean = false;

    public bullet:Bullet = null;

    public showCd = 3;

    public hideCd = 3;

    async start() {
        this.plane = this.node.getComponent(Plane);
        if (!this.plane) {
            return;
        }

        this.schedule(this._fire,0.1);
    }

    protected async _fire(dt?: number) {
        if (!App.gameDataInited) return;
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

        if (this.bullet && this.bullet.node) return;
        this.bullet = await this._createBullet();
    }

    protected update(dt: number): void {
        if (!this.plane || !this.bullet || !this.plane.node || !this.bullet.node) return;
        // if (this.followX) {
        //     this.bullet.node.x = this.plane.node.x;
        //     this.bullet.node.y = this.plane.node.y;
        // } else {
        //     this.bullet.node.x = this.plane.node.x;
        //     this.bullet.node.y = this.plane.node.y;
        // }
        // this.bullet.node.x = 10;
        // this.bullet.node.y = 10；
        this.bullet.node.x = this.plane.node.x;
        this.bullet.node.y = this.plane.node.y;
        this.showCd = this.showCd - dt;
        if(this.showCd <= 0){
           this.bullet.node.active = false;
           this.hideCd = this.hideCd - dt;
           if(this.hideCd <= 0){
               this.bullet.node.active = true;
               this.showCd = 3;
               this.hideCd = 3;
           }
        }
    }

}