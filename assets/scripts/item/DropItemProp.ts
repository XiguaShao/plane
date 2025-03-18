import { PropCfg } from "../common/JsonConfig";
import DropItem from "./DropItem";
import { EDropItemType } from "./DropItemConst";
import { WeaponSwapStrategy } from "./DropItemPropStrategy";
import { PropStrategyManager } from "./PropStrategyManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropItemProp extends DropItem {
    /**道具类型 */
    private _dropItemType: EDropItemType = null;
    private itemBg: cc.Node;
    private itemBg1: cc.Node;

    protected onLoad(): void {
        this.itemBg = this.node.getChildByName('item_bg');
        this.itemBg1 = this.node.getChildByName('item_bg1');
    }

    initCfg(cfg: PropCfg): void {
        super.initByCfg(cfg);
        let strategy = PropStrategyManager.instance.getStrategy(this.getDropItemType());
        strategy.setConfig(cfg);
    }
    
    /**
     * @description:碰撞回调
     * @param other 
     */
    onCollisionEnter(other: cc.Collider & { itemTag?: number }): void {
        console.log("dropItemType",this._dropItemType)
        const strategy = PropStrategyManager.instance.getStrategy(this._dropItemType);
        if (strategy) {
            const player = other.node.getComponent("PlayerPlane");
            strategy.apply(player);
        }
        this.destroy();
    }

    /**
     * @desc:设置道具类型
     * @param itemType 
     */
    setDropItemType(itemType: EDropItemType) {
        this._dropItemType = itemType;
    }

    /**
     * @desc:获取道具类型
     * @returns 
     */
    getDropItemType(): EDropItemType {
        return this._dropItemType;
    }

    protected update(dt: number): void {
        this.itemBg1 && (this.itemBg1.angle = -(-this.itemBg1.angle - 360 / 5 * dt) % 360);
        this.itemBg && (this.itemBg.angle = -(-this.itemBg.angle + 360 / 3 * dt + 360) % 360);
    }
}