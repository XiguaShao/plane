import { PropCfg } from "../common/JsonConfig";
import DropItem from "./DropItem";
import { ItemType } from "./ItemConst";
import { PropStrategyManager } from "./PropStrategyManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropItemProp extends DropItem {
    /**道具类型 */
    private _itemType: ItemType = null;
    private itemBg: cc.Node;
    private itemIcon: cc.Node;
    private itemBg1: cc.Node;

    protected onLoad(): void {
        this.itemBg = this.node.getChildByName('item_bg');
        this.itemIcon = this.node.getChildByName('itemIcon');
        this.itemBg1 = this.node.getChildByName('item_bg1');
    }

    initCfg(cfg: PropCfg): void {
        super.initByCfg(cfg);
        let strategy = PropStrategyManager.instance.getStrategy(this.getItemType());
        strategy.config = cfg;
    }
    
    /**
     * @description:碰撞回调
     * @param other 
     */
    onCollisionEnter(other: cc.Collider & { itemTag?: number }): void {
        console.log("itemType",this._itemType)
        const strategy = PropStrategyManager.instance.getStrategy(this._itemType);
        if (strategy) {
            const player = other.node.getComponent("PlayerPlane");
            strategy.apply(player);
        }
        this.node.destroy();
    }

    /**
     * @desc:设置道具类型
     * @param itemType 
     */
    setItemType(itemType: ItemType) {
        this._itemType = itemType;
    }

    /**
     * @desc:获取道具类型
     * @returns 
     */
    getItemType(): ItemType {
        return this._itemType;
    }

    protected update(dt: number): void {
        this.itemBg1.angle = -(-this.itemBg1.angle - 360 / 5 * dt) % 360
        this.itemBg.angle = -(-this.itemBg.angle + 360 / 3 * dt + 360) % 360
    }
}