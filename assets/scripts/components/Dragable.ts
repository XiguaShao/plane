const { ccclass, property } = cc._decorator;

/**
 * 可拖动组件
 */
@ccclass
export default class Dragable extends cc.Component {
    @property(cc.Node)
    target: cc.Node | null = null;

    onLoad(): void {
        //注册TOUCH_MOVE事件
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        cc.log('onload');
    }

    private _onTouchMove(touchEvent: cc.Event.EventTouch): void {
        //获取触摸移动增量
        const delta = touchEvent.getDelta();
        const node = this.target || this.node;
        //当前节点位置+增量，更新节点位置
        node.position = new cc.Vec3(
            node.position.x + delta.x,
            node.position.y + delta.y,
            node.position.z || 0
        );
    }
}