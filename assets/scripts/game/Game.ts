import ResourceManager from "../../framework/resourceManager/ResourceManager";
import NodePoolManager from "../../framework/utils/NodePoolManager";
import { TempConfig } from "../common/ResConst";
import GamePlayerData from "../data/GamePlayerData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game {
    public inited = false;
    public gameDataInited = false;
    public gameGlobal: any = {
    };
    public nodePoolMgr: NodePoolManager = null;
    public Rms: GamePlayerData = null;
    public ResManager: ResourceManager = null;
    public init() {
        if (!this.inited) {
            // 初始化管理类和utils类
            this.nodePoolMgr = new NodePoolManager();
            this.Rms = new GamePlayerData();
            this.ResManager = new ResourceManager();
        }
        this.inited = true;
        cc.game.emit("game-init");
    }

    /**
     * 初始化游戏数据
     */
    public initGameData() {
        cc.debug.setDisplayStats(false);
        this.Rms.initData();
        this._initCfg();
    }
    
    _initCfg() {
        const cfgs = [
            TempConfig.WaveConfig,
            TempConfig.PathConfig,
            TempConfig.PlaneConfig,
            TempConfig.BulletConfig,
            TempConfig.WeaponConfig,
            TempConfig.DropConfig
        ];
        ResourceManager.ins().loadResourceList(
            cfgs, 
            ()=>{
                this.gameDataInited = true;
            }, 
        null);
    
        // ResourceManager.ins().loadRes(TempConfig.WaveConfig, cc.JsonAsset, (err, asset) => {
        //     if (err) {
        //         cc.error("加载 Wave.json 失败:", err);
        //         return;
        //     }
        // });

        // ResourceManager.ins().loadRes(TempConfig.PathConfig, cc.JsonAsset, (err, asset) => {
        //     if (err) {
        //         cc.error("加载 Path.json 失败:", err);
        //         return;
        //     }
        // });

        // ResourceManager.ins().loadRes(TempConfig.PlaneConfig, cc.JsonAsset, (err, asset) => {
        //     if (err) {
        //         cc.error("加载 Path.json 失败:", err);
        //         return;
        //     }
        // });

        // ResourceManager.ins().loadRes(TempConfig.BulletConfig, cc.JsonAsset, (err, asset) => {
        //     if (err) {
        //         cc.error("加载 Bullet.json 失败:", err);
        //         return;
        //     }
        // });

        // ResourceManager.ins().loadRes(TempConfig.WeaponConfig, cc.JsonAsset, (err, asset) => {
        //     if (err) {
        //         cc.error("加载 Weapon.json 失败:", err);
        //         return;
        //     }
        // });

        // ResourceManager.ins().loadRes(TempConfig.DropConfig, cc.JsonAsset, (err, asset) => {
        //     if (err) {
        //         cc.error("加载 Drop.json 失败:", err);
        //         return;
        //     }
        // });
    }

    /**
     * 逻辑层的时间更新控制
     * @param dt 
     */
     public update(dt: number) {
        if(!this.inited) return ;
        // 例如Task.update(dt);,更新任务进度
    }
}