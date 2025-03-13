import Plane from '../plane/Plane';
import Bullet from '../bullet/Bullet';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Weapon extends cc.Component {
    @property(cc.Prefab)
    bulletPrefab: cc.Prefab | null = null;

    @property(cc.Vec2)
    offset: cc.Vec2 = cc.v2(0, 0);    //偏移位置

    @property
    rotation: number = 0;            //角度

    @property
    rate: number = 1;                //发射频率

    @property
    speed: number = 1000;            //速度

    @property
    count: number = 10;              //子弹个数, 0表示无限

    protected plane!: Plane;
    private _duration: number = 0;
    private _count: number = 0;

    start(): void {
        this.plane = this.node.getComponent(Plane);
        if (!this.plane) {
            return;
        }
        this._duration = 0;
        this._count = 0;
        if (this.rate === 0) {
            this._fire();    
        } else {
            this.schedule(this._fire, this.rate);
        }
    }

    protected _fire(dt?: number): void {
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

        const bullet = this._createBullet();
        if (bullet) {
            bullet.run(this.plane, this);
        }
    }

    /**
     * 创建子弹
     */
    protected _createBullet(): Bullet | null {
        if (!this.bulletPrefab) return null;
        
        const node = cc.instantiate(this.bulletPrefab);
        const p = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        node.position = cc.v3(this.node.parent.convertToNodeSpaceAR(p).add(this.offset));
        node.angle = this.node.angle - this.rotation;
        node.parent = this.node.parent;

        if (this.node.group === 'player') {
            node.group = 'player-bullet';
        } else {
            node.group = 'enemy-bullet';
        }
        let bullet = node.getComponent(Bullet);
        if(bullet.followTargetX) {
            bullet.target = this.plane.node;
        }
        return bullet;
    }

    assignParam(weapon: Weapon): void {
        weapon.bulletPrefab = this.bulletPrefab;
        weapon.rate = this.rate;
        weapon.speed = this.speed;
        weapon.count = this.count;
        weapon.rotation = this.rotation;
        weapon.offset = cc.v2(this.offset);
    } 
}