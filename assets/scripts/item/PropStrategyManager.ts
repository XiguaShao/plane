import { ItemConfigs, ItemType, PropConfig } from "./ItemConst";
import { PropStrategy, HealStrategy, ShieldStrategy } from "./DropItemPropStrategy";

export class PropStrategyManager {
    private static _instance: PropStrategyManager;
    private _strategyMap = new Map<ItemType, PropStrategy>();

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
        this.registerStrategy(ItemType.Shield, new ShieldStrategy());
        this.registerStrategy(ItemType.HP, new HealStrategy());
    }

    public registerStrategy(type: ItemType, strategy: PropStrategy) {
        const config:PropConfig = ItemConfigs.get(type);
        if (config) Object.assign(strategy.getConfig(), config);
        this._strategyMap.set(type, strategy);
    }

    public getStrategy(type: ItemType): PropStrategy | undefined {
        return this._strategyMap.get(type);
    }
}