import * as _ from 'lodash';
import * as async from 'async';

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
    const unitX = 102;
    const unitY = 102;
    const startX = -cc.winSize.width / 2 + unitX / 2;
    const startY = cc.winSize.height / 2 + unitY * 4;
    const array: cc.Vec2[] = [];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 7; j++) {
            const x = startX + unitX * j;
            const y = startY - unitY * i;
            array.push(cc.v2(x, y));  
        }
    }
    return array;
}

const { ccclass, property } = cc._decorator;

interface PathConfig {
    points: Array<[cc.Vec2, ...cc.Vec2[]]>;
}

@ccclass
export default class GeneratorPlane extends cc.Component {
    @property([cc.Prefab])
    planePrefabs: cc.Prefab[] = [];

    @property(cc.JsonAsset)
    stageAsset: cc.JsonAsset | null = null;   //飞机配置

    @property(cc.JsonAsset)
    pathAsset: cc.JsonAsset | null = null;    //飞行轨迹配置

    @property(cc.Node)
    target: cc.Node | null = null;            //生成飞机的父节点的 

    private _startPoints: cc.Vec2[] = [];

    start(): void {
        if (!this.stageAsset) return;
        const stage = this.stageAsset.json;
        const waves: GroupConfig[][] = Object.values(stage);
        this.init(waves);
    }

    init(waves: GroupConfig[][]): void {
        this._startPoints = generateStartPoints();
        
        async.eachSeries(waves, (waveConfig: GroupConfig[], cb) => {
            this._waveGenerate(waveConfig, cb);
        }, () => {
            cc.game.emit('pass-stage', this, waves);
        });
    }

    private _getStartPos(index: number): cc.Vec3 {
        return cc.v3(this._startPoints[index]);            
    }

    private _waveGenerate(waveConfig: GroupConfig[], callback: () => void): void {
        async.each(waveConfig, (groupConfig: GroupConfig, cb) => {
            if (groupConfig.nextWave === undefined) {
                groupConfig.nextWave = true;
            }
            
            if (groupConfig.type === 'sequence') {
                this._sequenceGenerate(groupConfig, cb);    
            } else if (groupConfig.type === 'spawn') {
                this._spawnGenerate(groupConfig, cb);
            } else if (groupConfig.type === 'sleep') {
                this.scheduleOnce(() => cb(), groupConfig.time || 0);
            }
        }, callback);
    }

    private _sequenceGenerate(groupConfig: GroupConfig, callback: () => void): void {
        if (!this.pathAsset || !this.target) return;
        const pathConfig: PathConfig = this.pathAsset.json[groupConfig.path || ''];
        let destroyCount = 0;

        async.mapSeries(_.range(0, groupConfig.count || 0), (i, cb: (error: Error | null, result?: cc.Node) => void) => {
            if (!groupConfig.planeID || !this.planePrefabs[groupConfig.planeID - 1]) {
                cb(null);
                return;
            }
            const plane = cc.instantiate(this.planePrefabs[groupConfig.planeID - 1]);
            plane.parent = this.target;
            plane.position = cc.v3(pathConfig.points[0][0]);
            const duration = (groupConfig.duration || 0) / pathConfig.points.length;
            const actions: any[] = pathConfig.points.map(param => {
                const array = param.slice(1).map(p => cc.v2(p));
                return cc.bezierTo(duration, array);
            });

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
            actions.push(callFunc); // 将 callFunc 包装在 sequence 中以满足 ActionInterval 类型要求
            plane.runAction(cc.sequence(actions));
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

    private _spawnGenerate(groupConfig: GroupConfig, callback: () => void): void {
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