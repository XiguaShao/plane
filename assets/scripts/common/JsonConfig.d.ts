export interface AccountlvCfg { 
   /** 账号等级 */
   rank:number,
   /** 提升所需经验值 */
   experience:number,
}

export interface BulletCfg { 
   /** 子弹ID */
   id:number,
   /** 资产  */
   asset:string,
   /** 伤害 */
   attack:number,
   /** 碰撞组 */
   group?:string,
   /** 碰撞类型 */
   colliderType?:string,
   /** 碰撞参数 */
   colliderParam?:object,
}

export interface ChapterCfg { 
   /** ID 主键 */
   id:number,
   /** 挑战消耗 [道具id，消耗数量] */
   spend:number[],
   /** 关卡调用 */
   level:number,
   /** 名称 */
   name:string,
   /** 介绍 */
   introduce:string,
   /** 经验奖励 */
   expreward:number,
   /** 首通奖励组 [道具id，道具数量]  */
   firstreward:number[][],
}

export interface PathCfg { 
   /** 路径ID */
   id:number,
   /** 路径类型直线=1贝赛尔曲线=2 */
   style:number,
   /** 相对或绝对绝对(xxxTo)=1相对(xxxBy)=2 */
   type:number,
   /** 路径参数点 */
   points:object,
   /** 曲线长度 */
   distances?:number[],
}

export interface PlaneCfg { 
   /** 飞机ID */
   id:number,
   /** 资产  */
   asset:string,
   /** 生命值 */
   hp:number,
   /** 防御 */
   defense:number,
   /** 击杀掉落 */
   dropItems:number[],
   /** 武器 关联Weapon表 */
   weapons:number[],
   /** 碰撞组 */
   group:string,
   /** 碰撞类型 */
   colliderType:string,
   /** 碰撞参数 */
   colliderParam:object,
}

export interface PropCfg { 
   /** 道具ID */
   id:number,
   /** 资产  */
   asset:string,
   /** 道具类型 货币=1 武器=2 效果=3 */
   type:number,
   /** 数量 */
   count?:number,
   /** 是否可覆盖 */
   isOverlap?:boolean,
   /** 标记 */
   tag?:number,
   /** 武器或效果ID 关联Weapon表 */
   weapons?:number[],
   /** 碰撞组 */
   group?:string,
   /** 碰撞类型 */
   colliderType?:string,
   /** 碰撞参数 */
   colliderParam?:object,
}

export interface StageCfg { 
   /** 波次ID */
   id:string,
   /** 波次序列 */
   subwaves:number[],
}

export interface WaveCfg { 
   /** 波次ID */
   id:number,
   /** 路径类型路径='sequence'阵型='spawn'休眠='sleep' */
   type:string,
   /** planeID关联plane表 */
   planeID?:number,
   /** 数量 */
   count?:number,
   /** 飞行时间 */
   duration?:number,
   /** 生成间隔 */
   interval?:number,
   /** 路径关联Path表sequence激活 */
   path?:string,
   /** 出生点索引spawn激活 */
   indexs?:number[],
   /** 休眠时间sleep激活 */
   time?:number,
   /** 垂直终点 */
   dy?:number,
   /** 飞行速度 */
   speed?:number,
   /** 波次同步 */
   nextWave?:boolean,
   /** 循环次数 */
   repeat?:number,
}

export interface WeaponCfg { 
   /** 武器ID */
   id:number,
   /** 武器类型 基础=1 扇形=2 曲线=3 */
   type:number,
   /** 资产  */
   asset:string,
   /** 偏移位置 */
   offset?:number[],
   /** 角度 */
   rotation?:number,
   /** 发射频率 */
   rate?:number,
   /** 子弹Id 关联Bullet表  */
   bulletId?:number,
   /** 最小曲度  */
   spinMin?:number,
   /** 最大曲度  */
   spinMax?:number,
   /** 角速度 */
   spinSpeed?:number,
   /** 速度 */
   speed:number,
   /** 子弹个数 */
   count?:number,
}

