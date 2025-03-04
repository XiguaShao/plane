import DropItem from './DropItem';
import Weapon from '../weapon/Weapon';

const { ccclass } = cc._decorator;

// let weaponParams = ['bulletPrefab', 'offset', 'rotation', 'rate', 'speed', 'count']
// let fanWeaponParams = weaponParams.concat();
// let spinWeaponParams = weaponParams.concat(['spinMin', 'spinMax', 'spinSpeed']);

@ccclass
export default class DropItemBullet extends DropItem {
    onLoad(): void {
        const weapons = this.node.getComponents('Weapon');
        weapons.forEach(weapon => weapon.enabled = false);
    }

    onCollisionEnter(other: cc.Collider & { itemTag?: number }): void {
        if (other.itemTag === this.tag) {
            this.node.destroy();
            return;
        }
        //移除当前武器
        const weapons = other.node.getComponents('Weapon');
        weapons.forEach(weapon => other.node.removeComponent(weapon));
        //增加新武器
        const newWeapons = this.node.getComponents('Weapon');
        newWeapons.forEach(weapon => {
            const newWeapon = other.node.addComponent(weapon.__classname__);
            weapon.assignParam(newWeapon);
            other.itemTag = this.tag;
        });
        this.node.destroy();        
    }
}