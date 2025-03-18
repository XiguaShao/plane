import { PropStrategy, HealStrategy, ShieldStrategy, WeaponSwapStrategy } from "./DropItemPropStrategy";
import { EDropItemType } from "./DropItemConst";
/**
 * @description:策略管理类
 */
export class PropStrategyManager {
    private static _instance: PropStrategyManager;
    private _strategyMap = new Map<EDropItemType, PropStrategy>();

    private constructor() {
        this.initializeStrategies();
    }

    public static get instance(): PropStrategyManager {
        if (!this._instance) {
            this._instance = new PropStrategyManager();
        }
        return this._instance;
    }

    private initializeStrategies() {
        this.registerStrategy(EDropItemType.Shield, new ShieldStrategy());
        this.registerStrategy(EDropItemType.HP, new HealStrategy());
        this.registerStrategy(EDropItemType.Weapon, new WeaponSwapStrategy())
    }

    /**
     * @desc:注册策略类
     * @param type 
     * @param strategy 
     */
    public registerStrategy(type: EDropItemType, strategy: PropStrategy) {
        this._strategyMap.set(type, strategy);
    }

    public getStrategy(type: EDropItemType): PropStrategy | undefined {
        return this._strategyMap.get(type);
    }
}