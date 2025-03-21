import DropItemProp from "./DropItemProp";
import { EDropItemType } from "./DropItemConst";

const { ccclass, property } = cc._decorator;
/**
 * @description: 血包道具
 */
@ccclass
export default class DropItemHpProp extends DropItemProp {
   protected onLoad(): void {
       super.onLoad();
       this.setDropItemType(EDropItemType.HP);
   }

}