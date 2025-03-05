// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

interface Point {
    x: number;
    y: number;
}


@ccclass
export default class BezierEditor extends cc.Component {
    @property(cc.Node)
    canvas: cc.Node | null = null;
    @property(cc.Prefab)
    pointPrefab: cc.Prefab | null = null;
    @property(cc.Graphics)
    graphics: cc.Graphics | null = null;
    private points: cc.Node[] = [];
    private isDragging: boolean = false;
    private selectedPoint: cc.Node | null = null;
    @property(cc.Button)
    resetButton: cc.Button | null = null;
    onLoad(): void {
        this._initEvents();
        this._initResetButton();
    }
    private _initResetButton(): void {
        if (!this.resetButton) return;
        this.resetButton.node.on('click', this._onReset, this);
    }
    private _onReset(): void {
        // 清除所有点
        this.points.forEach(point => point.destroy());
        this.points = [];
        
        // 清除曲线
        if (this.graphics) {
            this.graphics.clear();
        }
        
        // 重置状态
        this.isDragging = false;
        this.selectedPoint = null;
    }
    private _initEvents(): void {
        if (!this.canvas) return;

        this.canvas.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.canvas.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.canvas.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.canvas.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    private _onTouchStart(event: cc.Event.EventTouch): void {
        const touchPos = this.canvas.convertToNodeSpaceAR(event.getLocation());
        if (!touchPos || !this.pointPrefab) return;

        // 检查是否点击了已有的点
        for (const point of this.points) {
            const distance = point.position.sub(cc.v3(touchPos)).mag();
            if (distance < 20) {
                this.isDragging = true;
                this.selectedPoint = point;
                return;
            }
        }

        // 创建新点
        const point = cc.instantiate(this.pointPrefab);
        point.parent = this.canvas;
        point.position = cc.v3(touchPos);
        this.points.push(point);
        this._updateCurve();
    }

    private _onTouchMove(event: cc.Event.EventTouch): void {
        if (!this.isDragging || !this.selectedPoint || !this.canvas) return;

        const touchPos = this.canvas.convertToNodeSpaceAR(event.getLocation());
        this.selectedPoint.position = cc.v3(touchPos);
        this._updateCurve();
    }

    private _onTouchEnd(): void {
        this.isDragging = false;
        this.selectedPoint = null;
    }

    private _updateCurve(): void {
        if (!this.graphics || 
            this.points.length < 4 || 
            (this.points.length - 4) < 0 || 
            (this.points.length - 4) % 3 !== 0) return;

        this.graphics.clear();
        this.graphics.strokeColor = cc.Color.GREEN;
        this.graphics.lineWidth = 2;

        // 按每4个点为一组绘制贝塞尔曲线
        for (let i = 0; i < this.points.length - 3; i += 3) {
            const p0 = i === 0 ? this.points[0].position : this.points[i].position;
            const p1 = this.points[i + 1].position;
            const p2 = this.points[i + 2].position;
            const p3 = this.points[i + 3].position;
    
            this.graphics.moveTo(p0.x, p0.y);
            
            // 绘制100个点来模拟曲线
            for (let t = 0; t <= 1; t += 0.01) {
                const point = this._getBezierPoint(p0, p1, p2, p3, t);
                this.graphics.lineTo(point.x, point.y);
            }
        }
        
        this.graphics.stroke();
        this.exportPath();
    }

    exportPath(): void {
        if (this.points.length < 4) {
            cc.warn('需要至少4个点才能导出路径');
            return;
        }
    
        // 将点分组并转换为输出格式
        const groups: Point[][] = [];
        for (let i = 0; i < this.points.length - 3; i += 3) {
            const group = [];
            const p0 = i === 0 ? this.points[0] : this.points[i];
            const p1 = this.points[i + 1];
            const p2 = this.points[i + 2];
            const p3 = this.points[i + 3];
    
            group.push({
                x: Math.round(p0.position.x),
                y: Math.round(p0.position.y)
            });
            group.push({
                x: Math.round(p1.position.x),
                y: Math.round(p1.position.y)
            });
            group.push({
                x: Math.round(p2.position.x),
                y: Math.round(p2.position.y)
            });
            group.push({
                x: Math.round(p3.position.x),
                y: Math.round(p3.position.y)
            });
    
            groups.push(group);
        }
    
        // 构造符合原JSON格式的数据结构
        const pathData = {
            id: 1,
            sytle: 2,
            ctype: 1,
            points: groups
        };
    
        console.log(JSON.stringify(pathData, null, 2));
    }

    private _getBezierPoint(p0: cc.Vec3, p1: cc.Vec3, p2: cc.Vec3, p3: cc.Vec3, t: number): Point {
        const x = Math.pow(1 - t, 3) * p0.x + 
                 3 * Math.pow(1 - t, 2) * t * p1.x + 
                 3 * (1 - t) * Math.pow(t, 2) * p2.x + 
                 Math.pow(t, 3) * p3.x;
        
        const y = Math.pow(1 - t, 3) * p0.y + 
                 3 * Math.pow(1 - t, 2) * t * p1.y + 
                 3 * (1 - t) * Math.pow(t, 2) * p2.y + 
                 Math.pow(t, 3) * p3.y;
        
        return { x, y };
    }
}

