import Plane from '../plane/Plane';
import Bullet from '../bullet/Bullet';
import { getPrefabPath, TempConfig, TPrefab } from '../common/ResConst';
import ResourceManager from '../../framework/resourceManager/ResourceManager';
import { BulletCfg, WeaponCfg } from '../common/JsonConfig';
import { EWeaponType } from './WeaponConst';

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
    public _duration: number = 0;
    public _count: number = 0;
    //开火次数
    public fireCount = 0;
    //武器类型
    public type:EWeaponType = EWeaponType.Base;
    //武器子弹配置
    public _bulletCfg: BulletCfg = null;
    //子弹资源路径
    public _bulletAssetPath: string = getPrefabPath("Bullet_1", TPrefab.Bullet);

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

    protected async _fire(dt?: number) {
        if(!App.gameDataInited) return;
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

        const bullet = await this._createBullet();
        if (bullet) {
            bullet.run(this.plane, this);
        }
    }

    /**
     * 创建子弹
     */
    protected async _createBullet(): Promise<Bullet | null> {
        let node = await App.nodePoolMgr.getNode(this._bulletAssetPath);
        const p = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        node.position = cc.v3(this.node.parent.convertToNodeSpaceAR(p).add(this.offset));
        node.angle = this.node.angle - this.rotation;
        node.parent = App.gameGlobal.bulletLayer;

        if (this.node.group === 'player') {
            node.group = 'player-bullet';
        } else {
            node.group = 'enemy-bullet';
        }
        let bullet = node.getComponent(Bullet);
        bullet.initByCfg(this._bulletCfg);
        // if(bullet.followTargetX) {
        //     bullet.target = this.plane.node;
        // }
        return bullet;
    }

    assignParam(weapon: Weapon): void {
        weapon.bulletPrefab = this.bulletPrefab;
        weapon.rate = this.rate;
        weapon.speed = this.speed;
        weapon.count = this.count;
        weapon.rotation = this.rotation;
        weapon.offset = cc.v2(this.offset);
        weapon.type = this.type;
        weapon.fireCount = this.fireCount;
    } 

    initByCfg(cfg: WeaponCfg) {
        this._bulletCfg = ResourceManager.ins().getJsonById<BulletCfg>(TempConfig.BulletConfig, cfg.bulletId);
        this._bulletAssetPath = getPrefabPath(this._bulletCfg.asset, TPrefab.Bullet);
        
        console.log("子弹", this._bulletCfg.asset);
        if(this._bulletCfg.asset === "Bullet_6"){
            console.error("激光武器")
        }
        this.rate = cfg.rate;
        this.speed = cfg.speed;
        this.count = cfg.count;
        this.rotation = cfg.rotation || 0;
        this.offset = cc.v2(cfg.offset[0], cfg.offset[1]);
        this.type = cfg.type;
        this.fireCount = cfg.fireCount;
    }
}