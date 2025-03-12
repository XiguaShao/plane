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
        const delta = touchEvent.getDelta();
        const node = this.target || this.node;
        
        // 计算新位置
        const newX = node.position.x + delta.x;
        const newY = node.position.y + delta.y;
        
        // 获取屏幕尺寸
        const screenWidth = cc.winSize.width;
        const screenHeight = cc.winSize.height;
        
        // 限制在屏幕范围内
        const halfWidth = node.width / 2;
        const halfHeight = node.height / 2;
        const clampedX = cc.misc.clampf(newX, -screenWidth/2 + halfWidth, screenWidth/2 - halfWidth);
        const clampedY = cc.misc.clampf(newY, -screenHeight/2 + halfHeight, screenHeight/2 - halfHeight);

        // 更新位置
        node.position = new cc.Vec3(
            clampedX,
            clampedY,
            node.position.z || 0
        );
    }
}