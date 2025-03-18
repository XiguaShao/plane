import ResourceManager from "../../framework/resourceManager/ResourceManager";
import { PropCfg, WeaponCfg } from "../common/JsonConfig";
import { TempConfig } from "../common/ResConst";
import Weapon from "../weapon/Weapon";
import { EDropType } from "./DropItemConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DropItem extends cc.Component {
    @property
    count: number = 1;

    @property
    tag: number = 0;

    @property
    isOverlap: boolean = true;

    //掉落配置
    public dropCfg: PropCfg = null;
    //掉落类型
    public dropType: EDropType = null;
    //掉落的武器
    public dropWeaponIds: number[] = [];
    /**
     * @description:初始化配置
     * @param cfg 
     */
    initByCfg(cfg: PropCfg) {
        this.dropCfg = cfg;
        this.count = this.dropCfg.count || 1;
        this.tag = this.dropCfg.tag || 0;
        this.isOverlap = this.dropCfg.isOverlap || true;
        this.dropType = this.dropCfg.type;
        if (cfg.weapons) {
            this.dropWeaponIds = cfg.weapons;
        }
    }

    /**
     * @description 碰撞回调
     */
    onCollisionEnter(other: cc.Collider & { itemTag?: number }): void {
        this.node.destroy();
    }

}