import DropItem from './DropItem';  // Keep this import
import Weapon from '../weapon/Weapon';
import { TempConfig } from '../common/ResConst';
import { WeaponCfg } from '../common/JsonConfig';
import ResourceManager from '../../framework/resourceManager/ResourceManager';
import DropItemProp from './DropItemProp';
import { EDropItemType } from './DropItemConst';
import { PropStrategyManager } from './PropStrategyManager';
import { WeaponSwapStrategy } from './DropItemPropStrategy';

const { ccclass } = cc._decorator;

@ccclass
export default class DropItemBullet extends DropItemProp {
    onLoad(): void {
        super.onLoad();
        this.setDropItemType(EDropItemType.Weapon);
        const weapons = this.node.getComponents('Weapon');
        weapons.forEach(weapon => weapon.enabled = false);
    }

    onCollisionEnter(other: cc.Collider & { itemTag?: number }): void {
        if (other.itemTag === this.tag) {
            this.node.destroy();
            return;
        }
         
        console.log("dropItemType",this.getDropItemType())
        const strategy = PropStrategyManager.instance.getStrategy(this.getDropItemType()) as WeaponSwapStrategy;
        if (strategy) {
            const player = other.node.getComponent("PlayerPlane");
            console.log("掉落武器", this.dropWeaponIds);
            strategy.setWeaponIds(this.dropWeaponIds);
            strategy.apply(player);
        }
        other.itemTag = this.tag;
        this.node.destroy();
        return;


        //移除当前武器
        const weapons = other.node.getComponents('Weapon');
        weapons.forEach(weapon => other.node.removeComponent(weapon));

        //增加掉落新武器
        if (this.dropWeaponIds.length > 0) {
            console.log("掉落武器", this.dropWeaponIds);
            this.dropWeaponIds.forEach(weaponId => {
                let comp = other.node.addComponent(Weapon);
                let weaponCfg = ResourceManager.ins().getJsonById<WeaponCfg>(TempConfig.WeaponConfig, weaponId);
                if (!weaponCfg) {
                    console.error("武器表" + weaponId + "没有配置")
                    return;
                }
                comp.initByCfg(weaponCfg);

            });
            other.itemTag = this.tag;
        }

        this.node.destroy();        
    }
}