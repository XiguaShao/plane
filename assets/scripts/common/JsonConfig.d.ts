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
   group:string,
   /** 碰撞类型 */
   colliderType:string,
   /** 碰撞参数 */
   colliderParam:object,
}

export interface PathCfg { 
   /** 路径ID */
   id:number,
   /** 路径类型 直线=1 贝赛尔曲线=2 */
   sytle:number,
   /** 相对或绝对 绝对(xxxTo)=1 相对(xxxBy)=2 */
   ctype:number,
   /** 路径参数点 */
   points:object,
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
   ptype:number,
   /** 数量 */
   count:number,
   /** 是否可覆盖 */
   isOverlap:boolean,
   /** 标记 */
   tag:number,
   /** 武器或效果ID 关联Weapon表 */
   weapons:number[],
   /** 碰撞组 */
   group:string,
   /** 碰撞类型 */
   colliderType:string,
   /** 碰撞参数 */
   colliderParam:object,
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
   /** 路径类型 路径='sequence' 阵型='spawn' 休眠='sleep' */
   type:string,
   /** planeID 关联plane表 */
   planeID:number,
   /** 数量 */
   count:number,
   /** 飞行时间 */
   duration:number,
   /** 生成间隔 */
   interval:number,
   /** 路径 关联Path表 sequence激活 */
   path:string,
   /** 出生点索引 spawn激活 */
   indexs:number[],
   /** 休眠时间 sleep激活 */
   time:number,
   /** 垂直终点 */
   dy:number,
   /** 飞行速度 */
   speed:number,
   /** 波次同步 */
   nextWave:boolean,
}

export interface WeaponCfg { 
   /** 武器ID */
   id:number,
   /** 武器类型 基础=1 扇形=2 曲线=3 */
   wtype:number,
   /** 资产  */
   asset:string,
   /** 偏移位置 */
   offset:number[],
   /** 角度 */
   rotation:number,
   /** 发射频率 */
   rate:number,
   /** 子弹Id 关联Bullet表  */
   bulletId:number,
   /** 最小曲度  */
   spinMin:number,
   /** 最大曲度  */
   spinMax:number,
   /** 角速度 */
   spinSpeed:number,
   /** 速度 */
   speed:number,
   /** 子弹个数 */
   count:number,
}

