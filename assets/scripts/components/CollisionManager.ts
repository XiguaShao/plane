const { ccclass, property } = cc._decorator;

@ccclass
export default class CollisionManager extends cc.Component {
    @property
    properties: Record<string, unknown> = {};

    start(): void {
        //获取碰撞检测系统
        let manager = cc.director.getCollisionManager();
        //默认碰撞检测系统是禁用的，需要手动开启碰撞检测系统
        manager.enabled = true;
        //开启debugDraw后可在显示碰撞区域
        //manager.enabledDebugDraw = true;
    }
}