const { ccclass, property } = cc._decorator;

@ccclass
export default class DropItem extends cc.Component {
    @property
    count: number = 1;

    @property
    tag: number = 0;

    @property
    isOverlap: boolean = true;

    onCollisionEnter(other: cc.Collider & { itemTag?: number }): void {
        this.node.destroy();
    }
}