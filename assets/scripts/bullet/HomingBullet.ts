import EnemyPlane from "../plane/EnemyPlane";
import Plane from "../plane/Plane";
import Weapon from "../weapon/Weapon";
import Bullet, { RADIAN } from "./Bullet";

/**
 * @class HomingBullet
 * @description 自动追踪目标的子弹类，继承自基础子弹类
 * @property trackingFactor - 跟踪响应速度(0-1)，值越大转向越灵敏
 * @property maxTurnAngle - 单帧最大转向角度（度），防止急转弯
 * @property trackingDistance - 最大跟踪距离（像素），超出后停止追踪
 * @method run - 初始化子弹运动参数
 * @note 所有坐标计算基于世界坐标系
 */
const { ccclass, property } = cc._decorator;
@ccclass
export default class HomingBullet extends Bullet {
    @property({
        tooltip: "跟踪响应速度（0-1）0.15=中等灵敏度，1=即时转向，建议与子弹速度配合调整",
    })
    trackingFactor: number = 0.15;

    @property({
        tooltip: "最大转向角度（度）建议值：导弹类30-45，激光类5-15，高速子弹15-25",
    })
    maxTurnAngle: number = 8;

    @property({
        tooltip: "最大跟踪距离（像素）超出此距离将停止追踪，需大于武器射程",
    })
    trackingDistance: number = 600;

    private _currentVelocity: cc.Vec2 = cc.Vec2.ZERO;

    /**
     * 初始化子弹运动参数
     * @param plane 发射子弹的飞机实例
     * @param weapon 使用的武器实例
     */
    run(plane: Plane, weapon: Weapon): void {
        this._plane = plane;
        this._weapon = weapon;
        // 初始化速度方向（正Y轴方向 + 节点旋转角度）
        this._currentVelocity = cc.Vec2.UP
            .rotate(-this.node.angle * RADIAN)
            .mul(weapon.speed);
    }

    /**
     * 搜索屏幕视野内威胁最高的目标
     * @param nodeLayer 包含潜在目标的节点层级
     */
    searchTargetNode(nodeLayer: cc.Node): void {
        this.target = null; // 清空当前目标
        let maxThreat = 0;

        // 获取屏幕可见区域（世界坐标系）
        const screenRect = new cc.Rect(
            0,
            0,
            cc.view.getVisibleSize().width,
            cc.view.getVisibleSize().height
        );

        // 遍历所有子节点寻找目标
        nodeLayer.children.forEach(child => {
            if (!child.isValid) return;

            // 转换节点位置到世界坐标系
            const worldPos = child.parent.convertToWorldSpaceAR(child.position);

            // 屏幕内检测
            if (screenRect.contains(cc.v2(worldPos.x, worldPos.y))) {
                // 获取威胁值（假设敌人组件有threatValue属性）
                const enemy = child.getComponent(EnemyPlane);
                if (enemy && enemy.hp > maxThreat) {
                    maxThreat = enemy.hp;
                    this.target = child;
                }
            }
        });
    }

    /**
     * 每帧更新跟踪逻辑
     * @param dt 时间增量（单位：秒），通过父类update中间接获取
     */

    update(): void {
        super.update();
        const dt = cc.director.getDeltaTime();

        // 合并基础运动逻辑（删除重复的位置更新）
        // 假设使用 cc.Vec3 来更新位置，需要将 cc.Vec2 转换为 cc.Vec3
        const newPosition = this._currentVelocity.mul(dt);
        this.node.position = this.node.position.add(new cc.Vec3(newPosition.x, newPosition.y, 0));

        // 简化目标搜索条件
        if (!this.target || !this.target.isValid || !this.target.parent) {
            this.searchTargetNode(App.gameGlobal.planeLayer);
        }

        // 直接角度设置逻辑
        if (this.target && this.target.isValid) {
            // 使用本地坐标系（假设target与子弹在同一父节点）
            const targetPos = this.target.getPosition();
            const bulletPos = this.node.getPosition();
            const toTarget = targetPos.sub(bulletPos);

            // // 计算绝对角度
            // const normalizeVec = toTarget.normalize();
            // this.node.angle = cc.v2(0, 1).signAngle(normalizeVec) * (180 / Math.PI);

            // // 直接设置速度方向
            // this._currentVelocity = normalizeVec.mul(this._weapon.speed);


            // 应用跟踪距离限制
            if (toTarget.mag() > this.trackingDistance) {
                this.target = null;
                return;
            }

            // 计算方向向量
            const currentForward = cc.v2(0, 1).rotate(-this.node.angle * RADIAN);
            const desiredForward = toTarget.normalize();

            // 计算角度差值（弧度）
            const angleDeltaRad = currentForward.signAngle(desiredForward);

            // 应用跟踪响应速度（帧率补偿）
            const lerpFactor = Math.min(this.trackingFactor * 60 * dt, 1);
            let actualAngleDelta = angleDeltaRad * lerpFactor;

            // 应用最大转向限制（转换为弧度）
            const maxTurnRad = this.maxTurnAngle * RADIAN;
            actualAngleDelta = cc.misc.clampf(actualAngleDelta, -maxTurnRad, maxTurnRad);

            // 更新节点角度（弧度转角度）
            this.node.angle += actualAngleDelta * (180 / Math.PI);

            // 更新速度方向（保持武器速度）
            this._currentVelocity = currentForward.rotate(actualAngleDelta).mul(this._weapon.speed);
        }
    }

}