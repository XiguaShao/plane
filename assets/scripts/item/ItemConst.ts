// 定义 PropConfig 类型
export type PropConfig = {
    duration?: number;
    healAmount?: number;
};

export enum ItemType  {
    Shield = 1 ,        // 护盾值加成
    HP,                 // 生命值恢复
}

export const ItemConfigs = new Map<ItemType, PropConfig>([
    [ItemType.Shield, { duration: 3 }],
    [ItemType.HP, { healAmount: 3 }],
]);