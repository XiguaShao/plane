import Plane from "../plane/Plane";

export const ConfigBasePath = "config/";
export const TempConfig = {
    StageConfig: ConfigBasePath + "Stage2",
    PathConfig: ConfigBasePath + "Path",
    WaveConfig: ConfigBasePath + "Wave",
    ChapterConfig: ConfigBasePath + "Chapter",
    AttributeConfig: ConfigBasePath + "attribute",
    DropConfig: ConfigBasePath + "Prop",
    PlaneConfig: ConfigBasePath + "Plane",
    BulletConfig: ConfigBasePath + "Bullet",
    WeaponConfig: ConfigBasePath + "Weapon",
    SpawnerConfig: ConfigBasePath + "spawner",
    SkillConfig: ConfigBasePath + "skill",
    AccountlvCfg: ConfigBasePath + "Accountlv",
}

export const PlaneBasicPath = "prefabs/plane/enemyPlanes/";
export const PlaneBossPath = "prefabs/plane/bossPlanes/";

export const BulletPath = "prefabs/bullet/";
export const DropPath = "prefabs/item/";
export const EffectPath = "prefabs/effect/";
export const WornPath = "prefabs/worn/";
export enum TPrefab {
    Plane,
    PlaneBoss,
    Bullet,
    Prop,
    Effect,
    Worn
}

/**
 * 返回路径
 * @param asset 
 * @param type 
 * @returns 
 */
export function getPrefabPath(asset:string, type: TPrefab = TPrefab.Plane): string {
    switch(type) {
        case TPrefab.Plane: return PlaneBasicPath + asset; break;
        case TPrefab.PlaneBoss: return PlaneBossPath + asset; break;
        case TPrefab.Bullet: return BulletPath + asset; break;
        case TPrefab.Prop: return DropPath + asset; break;
        case TPrefab.Effect: return EffectPath + asset; break;
        case TPrefab.Worn: return WornPath + asset; break;
    }
    return "";
}