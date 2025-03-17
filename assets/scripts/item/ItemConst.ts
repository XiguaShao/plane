// 定义 PropConfig 类型
export type PropConfig = {
    /**持续时间 */
    duration?: number;
    /**恢复血量 */
    healAmount?: number;
};

//道具类型
export enum ItemType  {
    Shield = 1 ,        // 护盾值加成
    HP,                 // 生命值恢复
}

/**
 * @description:掉落类型
 */
export enum EDropType {
    //     货币=1
    Currency = 1,
    // 武器=2
    Weapon = 2,
    // 效果=3
    Effect = 3,
}  