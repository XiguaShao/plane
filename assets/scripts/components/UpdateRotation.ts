const { ccclass, property } = cc._decorator;

interface Vec2Like {
    x: number;
    y: number;
}

function getRotation(startPoint: Vec2Like, endPoint: Vec2Like, offset: number = 0): number {
    const x = endPoint.x - startPoint.x;
    const y = endPoint.y - startPoint.y;
    //与Y轴的夹角弧度
    const radian = Math.atan2(x, y);
    const rotation = (180 * radian / Math.PI) % 360 + offset;
    return -rotation;
}

@ccclass
export default class UpdateRotation extends cc.Component {
    @property
    public offsetRotation: number = 0;

    private samplePoint!: cc.Vec3;

    update(): void {
        if (!this.samplePoint) {
            this.samplePoint = this.node.position;
            return;
        }

        const distance = this.samplePoint.sub(this.node.position).mag();
        if (distance > 1) {
            const rotation = getRotation(this.samplePoint, this.node.position, this.offsetRotation);
            this.samplePoint = this.node.position;
            
            this.node.angle = rotation;
        }
    }
}