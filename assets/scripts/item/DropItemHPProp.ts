import DropItemProp from "./DropItemProp";
import { ItemType } from "./ItemConst";

const { ccclass, property } = cc._decorator;
/**
 * @description: 血包道具
 */
@ccclass
export default class DropItemHpProp extends DropItemProp {
   protected onLoad(): void {
       super.onLoad();
       this.setItemType(ItemType.HP);
   }

}