import Plane from '../plane/Plane';
import Weapon from '../weapon/Weapon';

const RADIAN = 2 * Math.PI / 360;

function getEndPoint(rotation: number, r: number): cc.Vec2 {
    //let r = cc.winSize.width;
	
    const x = r * Math.sin(rotation * RADIAN);
    const y = r * Math.cos(rotation * RADIAN);
    return cc.v2(x, y);
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property
    attack: number = 2;  //攻击力

    private _plane!: Plane;
    private _weapon!: Weapon;

    private _getMoveAction(weapon: Weapon): cc.ActionInterval {
        let distance: number, endPoint: cc.Vec2, moveAction: cc.ActionInterval;
        if (this._plane.node.group !== 'player') {
            this.node.angle = this.node.angle - 180;
        }
        endPoint = getEndPoint(-this.node.angle, cc.winSize.height).add(cc.v2(this.node.position.x, this.node.position.y));
        distance = endPoint.sub(cc.v2(this.node.position.x, this.node.position.y)).mag();
        const duration = distance / weapon.speed;
        moveAction = cc.moveTo(duration, endPoint);
        return moveAction;
    }

    run(plane: Plane, weapon: Weapon): void {
        this._plane = plane;
        this._weapon = weapon;

        const moveAction = this._getMoveAction(weapon); 
        const removeSelf = cc.removeSelf();
        const action = cc.sequence(moveAction, removeSelf);
        this.node.runAction(action);
    }

    /**
     * 获取子弹伤害
     */
    getDamageValue(): number {
        return this.attack;
    }

    /**
     * 碰撞后销毁
     */
    onCollisionEnter(): void {
        this.node.destroy();
    }

    update(): void {
        if (!this.node.parent) return;
        const rect = this.node.parent.getBoundingBox();
        if (!rect.contains(cc.v2(this.node.position.x, this.node.position.y))) {
            this.node.destroy();
        }
    }
}