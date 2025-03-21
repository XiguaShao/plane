import ResourceManager from "../resourceManager/ResourceManager";

/**
 * 对象池
 */
export default class NodePoolManager {

    public poolMap: Map<string, cc.NodePool> = new Map<string, cc.NodePool>();

    public nodePoolMap: Map<string, any> = new Map<string, any>();

    public async getNodeFromPool(name: string, path: string) {
        if (!name && name == "") {
            return null;
        }
        let nodePool = this.poolMap.get(name);
        if (!nodePool) {
            nodePool = new cc.NodePool();
            this.poolMap.set(name, nodePool);
        }
        let node;
        if (nodePool.size() < 1) {
            let prefab = await ResourceManager.ins().getPrefab(path);
            node = cc.instantiate(prefab);
        } else {
            node = nodePool.get();
        }
        node.active = true;
        return node;
    }

    public putNodeToPool(name: string, node: cc.Node) {
        if (!name && name == "") {
            return null;
        }
        let nodePool = this.poolMap.get(name);
        if (!nodePool) {
            nodePool = new cc.NodePool();
            this.poolMap.set(name, nodePool);
        }
        node.active = false;
        node.parent = null;
        nodePool.put(node);
    }

    //-----------------------------------------------------------------------------------
    getPool (key: string): GameNodePool {
        let pool = this.nodePoolMap.get(key);
        if (!pool) {
            pool = new GameNodePool();
            this.nodePoolMap.set(key, pool);
        }
        return pool;
    }

    public async getNode(key: string): Promise<cc.Node> {
        try {
            let pool = this.getPool(key);
            let node = pool.get();
            if (!node) {
                const prefab = await ResourceManager.ins().getPrefab(key);
                if (!prefab) {
                    throw new Error(`Failed to load prefab: ${key}`);
                }
                node = cc.instantiate(prefab);
                if (!node) {
                    throw new Error(`Failed to instantiate prefab: ${key}`);
                }
                Object.defineProperty(node, 'poolKey', {
                    value: key,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }
            return node;
        } catch (error) {
            cc.error(`NodePoolManager getNode error: ${error.message}`);
            throw error;
        }
    }

    /**
     * 放入对象池
     * @param node 节点对象
     * @param isRemove 是否从父节点移除(频繁创建带碰撞节点不移除)
     */
    public putNode (node: cc.Node, isRemove: boolean = false) {
        let key = node["poolKey"];
        let pool = this.getPool(key);
        pool.put(node, isRemove);
    }

    public clear(name: string) {
        let pool = this.poolMap[name];
        if (pool) {
            pool.clear();
        }
    }

}

export class GameNodePool {
    // 对象池
    private nodePool: cc.Node[] = [];

    get () {
        var last = this.nodePool.length-1;
        if (last < 0) {
            return null;
        }
        else {
            // Pop the last object in pool
            var obj = this.nodePool[last];
            this.nodePool.length = last;

            this.setComEnable(obj, true);
            return obj;
        }
    }

    put (node: cc.Node, isRemove) {
        if (node && this.nodePool.indexOf(node) === -1) {
            // Remove from parent, but don't cleanup
            // obj.removeFromParent(false);
            if (isRemove) {
                node.removeFromParent(false);
            } else {
                this.setComEnable(node, false);
                node.scale = 0;
                node.cleanup();            
            }

            this.nodePool[this.size()] = node;
        }
    }

    setComEnable (node, f) {
        let collisionComs = [];
        let comBox = node.getComponentsInChildren(cc.BoxCollider);
        let comCircle = node.getComponentsInChildren(cc.CircleCollider);
        let comPolygon = node.getComponentsInChildren(cc.PolygonCollider);
        collisionComs = collisionComs.concat(comBox, comCircle, comPolygon);
        for (let i = 0, len = collisionComs.length; i < len; i ++) {
            let com = collisionComs[i];
            com.node["isCanCol"] = !f;

            // console.log(" com " , com)
        }
    }

    size () {
        return this.nodePool.length;
    }

    clear () {
        for (let i = 0, len = this.nodePool.length; i < len; i ++) {
            let node = this.nodePool[i];
            node.destroy();
        }
        this.nodePool.length = 0;
    }
}
