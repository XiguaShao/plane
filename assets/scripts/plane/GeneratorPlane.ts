import * as _ from 'lodash';
import * as async from 'async';
import ResourceManager from '../../framework/resourceManager/ResourceManager';
import { TempConfig } from '../common/ResConst';
import { PathCfg, StageCfg, WaveCfg } from '../common/JsonConfig';

interface PathPoint {
    points: [cc.Vec2, ...cc.Vec2[]];
}

interface GroupConfig {
    type: 'sequence' | 'spawn' | 'sleep';
    nextWave?: boolean;
    planeID?: number;
    count?: number;
    duration?: number;
    interval?: number;
    path?: string;
    time?: number;
    indexs?: number[];
    speed?: number;
    dy?: number;
}

/**
 * 生成开始坐标点
 */
function generateStartPoints(): cc.Vec2[] {
    const unitX = 70;
    const unitY = 70;
    const startX = -((9 * unitX) / 2) + unitX / 2;
    // const startX = -cc.winSize.width / 2 + unitX / 2;
    const startY = cc.winSize.height / 2 + unitY * 4;
    const array: cc.Vec2[] = [];

    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 9; j++) {
            const x = startX + unitX * j;
            const y = startY - unitY * i;
            array.push(cc.v2(x, y));
        }
    }
    return array;
}

const { ccclass, property } = cc._decorator;

// interface PathConfig {
//     points: Array<[cc.Vec2, ...cc.Vec2[]]>;
//     repeat?: number;  // 新增 repeat 字段
// }

@ccclass
export default class GeneratorPlane extends cc.Component {
    @property([cc.Prefab])
    planePrefabs: cc.Prefab[] = [];

    // @property(cc.JsonAsset)
    stageAsset: cc.JsonAsset | null = null;   //飞机配置

    // @property(cc.JsonAsset)
    pathAsset: cc.JsonAsset | null = null;    //飞行轨迹配置

    @property(cc.Node)
    target: cc.Node | null = null;            //生成飞机的父节点的 

    private _startPoints: cc.Vec2[] = [];
    private _waves: StageCfg[] = [];

    start(): void {
        ResourceManager.ins().loadRes(TempConfig.WaveConfig, cc.JsonAsset, (err, asset) => {
            if (err) {
                cc.error("加载 Wave.json 失败:", err);
                return;
            }
        });

        ResourceManager.ins().loadRes(TempConfig.PathConfig, cc.JsonAsset, (err, asset) => {
            if (err) {
                cc.error("加载 Wave.json 失败:", err);
                return;
            }
        });
    }

    loadStage(chapter: number) {
        ResourceManager.ins().loadRes(`config/Stage${chapter}`, cc.JsonAsset, (err, asset) => {
            if (err) {
                cc.error("加载 stage1.json 失败:", err);
                return;
            }
            const stage = asset.json;
            const waves: StageCfg[] = Object.values(stage);
            this.init(waves);
        });
    }

    init(waves: StageCfg[]): void {
        this._startPoints = generateStartPoints();
        this._waves = waves;

        async.eachSeries(this._waves, (stageCfg: StageCfg, cb) => {
            this._waveGenerate(stageCfg.subwaves, cb);
        }, () => {
            cc.game.emit('pass-stage', this, this._waves);
        });
    }

    startGame(chapter: number) {
        this.loadStage(chapter);
    }


    private _getStartPos(index: number): cc.Vec3 {
        return cc.v3(this._startPoints[index]);
    }

    private _waveGenerate(waveConfig: number[], callback: () => void): void {
        async.each(waveConfig, (waveIndex: number, cb) => {
            let groupConfig = ResourceManager.ins().getJsonById<WaveCfg>(TempConfig.WaveConfig, waveIndex);
            if (groupConfig.nextWave === undefined) {
                groupConfig.nextWave = true;
            }
            console.log("current wave index: ", waveIndex)
            if (groupConfig.type === 'sequence') {
                this._sequenceGenerate(groupConfig, cb);
            } else if (groupConfig.type === 'spawn') {
                this._spawnGenerate(groupConfig, cb);
            } else if (groupConfig.type === 'sleep') {
                this.scheduleOnce(() => cb(), groupConfig.time || 0);
            }
        }, callback);
    }

    private _sequenceGenerate(groupConfig: WaveCfg, callback: () => void): void {
        if (!this.target) return;
        let pathConfig = ResourceManager.ins().getJsonById<PathCfg>(TempConfig.PathConfig, groupConfig.path);
        // const pathConfig: PathConfig = this.pathAsset.json[groupConfig.path || ''];
        let destroyCount = 0;

        async.mapSeries(_.range(0, groupConfig.count || 0), (i, cb: (error: Error | null, result?: cc.Node) => void) => {
            if (!groupConfig.planeID || !this.planePrefabs[groupConfig.planeID - 1]) {
                cb(null);
                return;
            }
            const plane = cc.instantiate(this.planePrefabs[groupConfig.planeID - 1]);
            plane.parent = this.target;
            plane.position = cc.v3(pathConfig.points[0][0]);
            const duration = (groupConfig.duration || 6) / pathConfig.points.length;
            let actions: any[] = null;
            if(pathConfig.style === 1) {
                // Line mode: create moveTo actions between points
                const array = pathConfig.points[0].slice(1).map(p => cc.v2(p));
                let beginPos = cc.v2(pathConfig.points[0][0])
                actions = array.map(endPos => {
                    let distance = endPos.sub(beginPos).mag();
                    beginPos.x = endPos.x;
                    beginPos.y = endPos.y;
                    return cc.moveTo(distance/groupConfig.speed, endPos)
                })
            } else {
                let index = 0;
                actions = pathConfig.points.map(param => {
                    let distance = 400;
                    if(pathConfig.distances && index < pathConfig.distances.length) {
                        distance = pathConfig.distances[index];
                    }
                    const array = param.slice(1).map(p => cc.v2(p));
                    return cc.bezierTo(distance/groupConfig.speed, array);

                    index++;

                });
            }

            let finalAction: cc.ActionInterval;
            if (groupConfig.repeat === undefined) {
                // 不循环
                finalAction = null;
            } else if (groupConfig.repeat === 0) {
                // 永久循环
                finalAction = cc.repeatForever(cc.sequence(actions));
            } else {
                // 循环指定次数
                finalAction = cc.repeat(cc.sequence(actions), groupConfig.repeat);
            }

            //停止移动
            const callFunc = cc.callFunc(() => {
                if (plane.isValid) {
                    plane.emit('move-end');
                    plane.destroy();
                    destroyCount++;
                    cc.log('move-end', destroyCount);
                    if (!groupConfig.nextWave && destroyCount >= (groupConfig.count || 0)) {
                        callback();
                    }
                }
            });

            if(finalAction) {
                if(groupConfig.repeat === 0) {
                    plane.runAction(finalAction);
                } else {
                    plane.runAction(cc.sequence([finalAction, callFunc]));
                }
                
            } else {
                plane.runAction(cc.sequence([...actions, callFunc]));
            }
            this.scheduleOnce(() => cb(null, plane), groupConfig.interval || 0);

            //监听击落
            plane.on('shoot-down', () => {
                if (plane.isValid) {
                    destroyCount++;
                    cc.log('shoot-down', destroyCount);
                    if (!groupConfig.nextWave && destroyCount >= (groupConfig.count || 0)) {
                        callback();
                    }
                }
            });
        }, () => {
            if (groupConfig.nextWave) {
                callback();
            }
        });
    }

    private _spawnGenerate(groupConfig: WaveCfg, callback: () => void): void {
        if (!this.target) return;
        const array = groupConfig.indexs || [];
        let destroyCount = 0;

        async.each(array, (index: number, cb: (error?: Error) => void) => {
            if (!groupConfig.planeID || !this.planePrefabs[groupConfig.planeID - 1]) return;
            const plane = cc.instantiate(this.planePrefabs[groupConfig.planeID - 1]);
            plane.parent = this.target;
            plane.position = this._getStartPos(index - 1);
            const dy = groupConfig.dy || -cc.winSize.height / 2 - plane.y;
            const duration = Math.abs(dy / (groupConfig.speed || 1));
            const moveBy = cc.moveBy(duration, cc.v2(0, dy));
            const callFunc = cc.callFunc(() => {
                if (plane.isValid && !groupConfig.dy) {
                    plane.emit('move-end');
                    plane.destroy();
                    destroyCount++;
                    cc.log('move-end', destroyCount);
                    if (!groupConfig.nextWave && destroyCount >= array.length) {
                        callback();
                    }
                }
            });
            plane.runAction(cc.sequence(moveBy, callFunc));
            //监听击落
            plane.on('shoot-down', () => {
                if (plane.isValid) {
                    destroyCount++;
                    cc.log('shoot-down', destroyCount);
                    if (!groupConfig.nextWave && destroyCount >= array.length) {
                        callback();
                    }
                }
            });
            cb();
        }, () => {
            if (groupConfig.nextWave) {
                callback();
            }
        });
    }
}