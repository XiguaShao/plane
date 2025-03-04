import * as _ from 'lodash';
import * as async from 'async';

const { ccclass, property } = cc._decorator;

@ccclass('PlaneParam')
class PlaneParam {
    @property(cc.Prefab)
    planePrefab: cc.Prefab | null = null;

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab | null = null;

    @property(cc.Integer)
    count: number = 10;

    @property(cc.Integer)
    move: number = 0;
}

@ccclass
export default class PlaneGenerator extends cc.Component {
    @property([PlaneParam])
    planes: PlaneParam[] = [];

    @property
    rate: number = 2;

    @property(cc.Node)
    target: cc.Node | null = null;

    @property(cc.JsonAsset)
    pathAsset: cc.JsonAsset | null = null;

    private _index: number = 0;

    start(): void {
        this._index = 0;
        this.schedule(this._createPlane, this.rate);
    }

    private _createPlane(): void {
        //飞机参数
        const planeParam = this.planes[this._index];
        if (!planeParam || !planeParam.planePrefab || !this.target) {
            cc.log('没有飞机了');
            return;
        }
        //数量减少
        planeParam.count--;
        if (planeParam.count === 0) {
            this._index++;
        }
        //创建
        const planeNode = cc.instantiate(planeParam.planePrefab);
        const plane = planeNode.getComponent('Plane');
        planeNode.x = _.random(-cc.winSize.width / 2 + planeNode.width / 2, cc.winSize.width / 2 - planeNode.width / 2);
        planeNode.y = _.random(cc.winSize.height / 2, cc.winSize.height / 2 + planeNode.height);
        //plane.bulletPrefab = planeParam.bulletPrefab;
        planeNode.parent = this.target;
        //飞行(应该由飞机自己决定)    
        if (planeParam.move === 0) {
            this._planeAction(planeNode);
        } else {
            planeNode.x = 0;
            planeNode.runAction(cc.moveTo(3, planeNode.x, cc.winSize.height / 2 * 0.5));
        }
    }

    private _planeAction(planeNode: cc.Node): void {
        if (!this.pathAsset) return;
        const pathConfig = _.sample(this.pathAsset.json);
        //曲线
        if (pathConfig.type === 1) {
            planeNode.position = cc.v3(pathConfig.points[0][0]);
            const actions = pathConfig.points.map(param => {
                const array = param.slice(1).map(p => cc.v2(p));
                return cc.bezierTo(_.random(5, 10), array);
            });
            if (actions.length === 1) {
                planeNode.runAction(actions[0]);
            } else {
                planeNode.runAction(cc.sequence(actions));  
            }
        }
    }
}