import * as _ from 'lodash';
import Plane from './Plane';
import UpdateRotation from '../../scripts/components/UpdateRotation';
import ResourceManager from '../../framework/resourceManager/ResourceManager';
import { getPrefabPath, TempConfig, TPrefab } from '../common/ResConst';
import { AccountlvCfg, PropCfg } from '../common/JsonConfig';
import DropItem from '../item/DropItem';
import { PLAYER_DATE_TYPE } from '../data/GamePlayerData';

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyPlane extends Plane {
    @property([cc.Prefab])
    dropItems: cc.Prefab[] = []; //掉落物品


    onLoad(): void {
        const updateRotation = this.node.addComponent(UpdateRotation);
        updateRotation.offsetRotation = 180;
    }

    /**
     * 碰撞监听
     * @param {cc.Collider} other 
     */
    onCollisionEnter(other: cc.Collider): void {
        if (other.node.group === 'player') {
            //碰到玩家飞机
            // this._playDestroy();
            
            this.takeDamage(2 + this.getPlayerPlaneDamage());
            if (this.hp > 0) {
                this._progressBar.node.runAction(cc.fadeOut(1));
            }
        } else {
            //碰到玩家子弹
            this._progressBar.node.opacity = 255;
            const bullet = other.getComponent('Bullet');
            this.takeDamage(bullet.getDamageValue() + this.getPlayerPlaneDamage())  ;
            // this.hp -= bullet.getDamageValue();
            if (this.hp > 0) {
                this._progressBar.node.runAction(cc.fadeOut(1));
            }
        }
    }

    /**
     * @description:获取自己飞机自身伤害
     * @returns 
     */
    getPlayerPlaneDamage(): number {
        let level = App.Rms.getDataByType(PLAYER_DATE_TYPE.roleLv) || 1
        let curConfig = ResourceManager.ins().getJsonById<AccountlvCfg>(TempConfig.AccountlvCfg, level);
        return curConfig && curConfig.attack || 2;
    }

    @property({
        type: [cc.Float],
        tooltip: "对应物品的掉落概率 (0-100)",
        range: [0, 100],
        slide: true,
        step: 1
    })
    dropRates: number[] = [];

    protected async _playDestroy() {
        cc.game.emit('enemy-plane-destroy', this);

        // 掉落物品
        let dropItems = this.getDropItems();
        let dropItemRates = this.getDropItemRates();
        if (dropItems && dropItems.length) {
            const random = Math.random() * 100; // 随机值 0-100
            let currentSum = 0;
            let bDrop = false;
            // 根据概率选择道具
            for (let i = 0; i < dropItems.length; i++) {
                currentSum += dropItemRates[i] || 0;
                if (random <= currentSum && random > (currentSum - dropItemRates[i])) {
                    // 生成选中的道具
                    // const node = cc.instantiate(this.dropItems[i]);
                    // node.parent = App.gameGlobal.dropLayer;
                    // node.position = this.node.position;

                    const node = await this.createDropNode(dropItems[i]);
                    if (!node) {
                        console.error("没有掉落")
                        return;
                    }
                    const p = cc.v2(node.x + (Math.random() > 0.5 ? -50 : 50), node.y);
                    const array = [
                        cc.v2(node.x, node.y + 100),
                        cc.v2(p.x, p.y + 100),
                        p,
                    ];
                    const jumpBy = cc.bezierTo(0.4, array).easing(cc.easeSineOut());

                    const y = -cc.winSize.height / 2 - p.y;
                    const duration = Math.abs(y / (60 + Math.random() * 40));
                    const moveTo = cc.moveTo(duration, cc.v2(p.x, y)).easing(cc.easeSineOut());
                    const removeSelf = cc.removeSelf();
                    node.runAction(cc.sequence(jumpBy, moveTo, removeSelf));
                    bDrop = true;
                    break;
                }
            }
            if (!bDrop) {
                console.log("掉落未命中")
            }
        }

        super._playDestroy();
    }

    /**
     * @description:创建掉落节点
     * @param dropId 
     */
    async createDropNode(dropId): Promise<cc.Node> {
        if (!dropId) {
            console.error("dropId is null")
        }
        let dropCfg = ResourceManager.ins().getJsonById<PropCfg>(TempConfig.DropConfig, dropId);
        if (!dropCfg) {
            console.error(dropId, "dropCfg is null");
            return null;
        }

        let prefabPath = getPrefabPath(dropCfg.asset, TPrefab.Prop);
        let node = await App.nodePoolMgr.getNodeFromPool(dropCfg.asset, prefabPath);
        if (node) {
            node.parent = App.gameGlobal.dropLayer;
            node.position = this.node.position;
            let dropItem:DropItem = node.getComponent("DropItem");
            dropItem.initByCfg(dropCfg);
            return node;
        }
    }
}