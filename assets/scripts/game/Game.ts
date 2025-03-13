import ResourceManager from "../../framework/resourceManager/ResourceManager";
import NodePoolManager from "../../framework/utils/NodePoolManager";
import GamePlayerData from "../data/GamePlayerData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game {
    public inited = false;
    public gameGlobal: any = null;
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
    }

    /**
     * 初始化游戏数据
     */
    public initGameData() {
        cc.debug.setDisplayStats(false);
        this.Rms.initData();
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