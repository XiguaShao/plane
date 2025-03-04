const { ccclass, property, requireComponent } = cc._decorator;

@ccclass
@requireComponent(cc.Camera)
export default class ScrollCamera extends cc.Component {
    @property
    speed: number = 300;

    @property([cc.Node])
    loopGrounds: cc.Node[] = [];

    private camera!: cc.Camera;

    start(): void {
        this.camera = this.getComponent(cc.Camera);
        //初始化背景图片位置
        let node = this.loopGrounds[0];
        if (!node) {
            return;
        }
        node.position = cc.v3(0, 0, 0);
        for (let i = 1; i < this.loopGrounds.length; i++) {
            let front = this.loopGrounds[i - 1];
            node = this.loopGrounds[i];
            node.position = cc.v3(0, front.y + (front.height + node.height) / 2);   
        } 
    }

    update(dt: number): void {
        let current = this.loopGrounds[0];
        if (current) {
            let offset = (cc.winSize.height - current.height) / 2;     
            if (this.camera.node.y > current.y + current.height + offset) { 
                let last = this.loopGrounds[this.loopGrounds.length - 1];
                this.loopGrounds.shift();
                this.loopGrounds.push(current);
                current.y = last.y + (last.height + current.height) / 2;
            }
        }
        this.node.y += dt * this.speed;
    }
}