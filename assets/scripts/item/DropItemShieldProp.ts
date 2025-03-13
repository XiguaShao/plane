import DropItemProp from "./DropItemProp";
import { ItemType } from "./ItemConst";

const { ccclass, property } = cc._decorator;
/**
 * @description:护盾道具
 */
@ccclass
export default class DropItemShieldProp extends DropItemProp {
    protected onLoad(): void {
        super.onLoad();
        this.setItemType(ItemType.Shield);
    }
}