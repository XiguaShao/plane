import Singleton from "../../framework/utils/Singleton";

const {ccclass, property} = cc._decorator;

/** 数据类型 */
export enum PLAYER_DATE_TYPE {
    money,
    chapter,
    round,
    roundData,
    roleLv,
    roleExp
}

/** 数据变量名 */
export const PlayerDataNames: {[key: number] : string} = {
    [PLAYER_DATE_TYPE.money] : "_money",
    [PLAYER_DATE_TYPE.chapter] : "_chapter",
    [PLAYER_DATE_TYPE.round] : "_round",
    [PLAYER_DATE_TYPE.roundData] : "_roundData",
    [PLAYER_DATE_TYPE.roleLv] : "_roleLv",
    [PLAYER_DATE_TYPE.roleExp] : "_roleExp",
}

/**
 * 玩家数据类
 */
export class PlayerData {
    // 金钱
    public _money: number = 0;
    // 章节
    public _chapter: number = 1;
    // 关卡 暂时不用
    public _round: number = 1;
    // 关卡数据
    public _roundData: any = {};
    //等级
    public _roleLv: number = 0;
    //经验
    public _roleExp: number = 0;
}

/**
 * 玩家数据管理类
 */
@ccclass
export default class GamePlayerData extends Singleton {
    private _playerData: PlayerData;

    /**
     * 初始化玩家数据
     */
    public initData() {
        this._playerData = new PlayerData();
        this.loadData();
    }

    /**
     * 更新数据
     * @param type 
     * @param value 
     * @returns 
     */
    updateDataByType(type: PLAYER_DATE_TYPE, value) {
        if (!value) {
            return 
        }
        if (value == this._playerData[PlayerDataNames[type]]) {
            return
        }
        this._playerData[PlayerDataNames[type]] = value;
        this.saveData();
    }

    /**
     * 获取数据
     * @param type 
     * @returns 
     */
    getDataByType(type: PLAYER_DATE_TYPE) {
        return this._playerData[PlayerDataNames[type]];
    }

    /**
     * 保存数据
     */
    public saveData () {
        cc.sys.localStorage.setItem('plane_playerData', JSON.stringify(this._playerData));
    }

    /**
     * 加载数据
     */
    public loadData () {
        let data = JSON.parse(cc.sys.localStorage.getItem('plane_playerData'));
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(this._playerData, key)) {
                this._playerData[key] = data[key];
            }
        }
    }

}
