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
    @property(cc.Button)
    resetButton: cc.Button | null = null;
    @property
    isLineMode: boolean = false;  // 是否为直线模式

    private points: cc.Node[] = [];
    private isDragging: boolean = false;
    private selectedPoint: cc.Node | null = null;
    @property(cc.Button)
    hMirrorButton: cc.Button | null = null;    // 水平镜像按钮
    @property(cc.Button)
    vMirrorButton: cc.Button | null = null;    // 垂直镜像按钮

    onLoad(): void {
        this._initEvents();
        this._initResetButton();
        this._initMirrorButtons();
        // 初始化时绘制标尺
        this._drawRuler();
    }

    @property(cc.Prefab)
    labelPrefab: cc.Prefab | null = null;    // Add this property for label prefab

    private scaleLabels: cc.Node[] = [];      // Add this property to track labels

    private _drawRuler(): void {
        if (!this.graphics || !this.canvas) return;

        // Clear old labels
        this.scaleLabels.forEach(label => label.destroy());
        this.scaleLabels = [];

        this.graphics.clear();
        const width = this.canvas.width;
        const height = this.canvas.height;
        const step = 50;
        const majorStep = 100; // 主要刻度间隔

        // Draw grid lines
        this.graphics.strokeColor = new cc.Color(128, 128, 128, 80);
        this.graphics.lineWidth = 2;

        // Draw vertical lines and scale
        for (let x = 0; x <= width/2; x += step) {
            // 绘制所有50间隔的线
            this.graphics.moveTo(x, -height/2);
            this.graphics.lineTo(x, height/2);
            this.graphics.moveTo(-x, -height/2);
            this.graphics.lineTo(-x, height/2);
            
            // 只在100的倍数处添加刻度标签
            if (x % majorStep === 0 && x !== 0 && this.labelPrefab) {
                const rightLabel = cc.instantiate(this.labelPrefab);
                rightLabel.getComponent(cc.Label).string = x.toString();
                rightLabel.parent = this.canvas;
                rightLabel.position = cc.v3(x, 10, 0);
                this.scaleLabels.push(rightLabel);

                const leftLabel = cc.instantiate(this.labelPrefab);
                leftLabel.getComponent(cc.Label).string = (-x).toString();
                leftLabel.parent = this.canvas;
                leftLabel.position = cc.v3(-x, 10, 0);
                this.scaleLabels.push(leftLabel);
            }
        }

        // Draw horizontal lines and scale
        for (let y = 0; y <= height/2; y += step) {
            // 绘制所有50间隔的线
            this.graphics.moveTo(-width/2, y);
            this.graphics.lineTo(width/2, y);
            this.graphics.moveTo(-width/2, -y);
            this.graphics.lineTo(width/2, -y);
            
            // 只在100的倍数处添加刻度标签
            if (y % majorStep === 0 && y !== 0 && this.labelPrefab) {
                const topLabel = cc.instantiate(this.labelPrefab);
                topLabel.getComponent(cc.Label).string = y.toString();
                topLabel.parent = this.canvas;
                topLabel.position = cc.v3(10, y, 0);
                this.scaleLabels.push(topLabel);

                const bottomLabel = cc.instantiate(this.labelPrefab);
                bottomLabel.getComponent(cc.Label).string = (-y).toString();
                bottomLabel.parent = this.canvas;
                bottomLabel.position = cc.v3(10, -y, 0);
                this.scaleLabels.push(bottomLabel);
            }
        }
        this.graphics.stroke();

        // Draw center point and cross lines
        this.graphics.strokeColor = cc.Color.YELLOW;
        this.graphics.fillColor = cc.Color.YELLOW;
        this.graphics.circle(0, 0, 5);
        this.graphics.fill();
        this.graphics.stroke();

        // Draw center cross lines
        this.graphics.strokeColor = cc.Color.RED;
        this.graphics.lineWidth = 2;
        this.graphics.moveTo(-width/2, 0);
        this.graphics.lineTo(width/2, 0);
        this.graphics.moveTo(0, -height/2);
        this.graphics.lineTo(0, height/2);
        this.graphics.stroke();

        // Add origin label (0,0)
        if (this.labelPrefab) {
            const originLabel = cc.instantiate(this.labelPrefab);
            originLabel.getComponent(cc.Label).string = "0";
            originLabel.parent = this.canvas;
            originLabel.position = cc.v3(10, 10, 0);
            this.scaleLabels.push(originLabel);
        }
    }
    private _initMirrorButtons(): void {
        if (this.hMirrorButton) {
            this.hMirrorButton.node.on('click', this._onHorizontalMirror, this);
        }
        if (this.vMirrorButton) {
            this.vMirrorButton.node.on('click', this._onVerticalMirror, this);
        }
    }

    private _onHorizontalMirror(): void {
        if (this.points.length === 0) return;
        
        this.points.forEach(point => {
            point.position = cc.v3(-point.position.x, point.position.y, point.position.z);
        });
        this._updateCurve();
    }

    private _onVerticalMirror(): void {
        if (this.points.length === 0) return;
        
        this.points.forEach(point => {
            point.position = cc.v3(point.position.x, -point.position.y, point.position.z);
        });
        this._updateCurve();
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
        if (!this.graphics) return;

        this.graphics.clear();
        
        // 绘制标尺线
        this._drawRuler();

        // 绘制路径
        if (this.points.length < 2) return;
        this.graphics.strokeColor = cc.Color.GREEN;
        this.graphics.lineWidth = 2;

        if (this.isLineMode) {
            this._drawLines();
        } else {
            if (this.points.length < 4 || (this.points.length - 4) % 3 !== 0) return;
            this._drawBezier();
        }
        
        this.graphics.stroke();
        this.exportPath();
    }

    private _drawLines(): void {
        // 绘制直线
        for (let i = 0; i < this.points.length - 1; i++) {
            const p0 = this.points[i].position;
            const p1 = this.points[i + 1].position;
            this.graphics.moveTo(p0.x, p0.y);
            this.graphics.lineTo(p1.x, p1.y);
        }
    }

    private _drawBezier(): void {
        // 原有的贝塞尔曲线绘制逻辑
        for (let i = 0; i < this.points.length - 3; i += 3) {
            const p0 = i === 0 ? this.points[0].position : this.points[i].position;
            const p1 = this.points[i + 1].position;
            const p2 = this.points[i + 2].position;
            const p3 = this.points[i + 3].position;
    
            this.graphics.moveTo(p0.x, p0.y);
            for (let t = 0; t <= 1; t += 0.01) {
                const point = this._getBezierPoint(p0, p1, p2, p3, t);
                this.graphics.lineTo(point.x, point.y);
            }
        }
    }

    exportPath(): void {
        if (this.points.length < 2) {
            cc.warn('需要至少2个点才能导出路径');
            return;
        }
    
        const groups: Point[][] = [];
        const distances: number[] = [];
        if (this.isLineMode) {
            // 直线模式导出 - 所有点合并到一个数组
            const linePoints: Point[] = this.points.map(point => ({
                x: Math.round(point.position.x),
                y: Math.round(point.position.y)
            }));
            groups.push(linePoints);
        } else {
            // 原有的贝塞尔曲线导出逻辑
            for (let i = 0; i < this.points.length - 3; i += 3) {
                const group = [];
                const p0 = i === 0 ? this.points[0] : this.points[i];
                const p1 = this.points[i + 1];
                const p2 = this.points[i + 2];
                const p3 = this.points[i + 3];
        
                group.push({x: Math.round(p0.position.x), y: Math.round(p0.position.y)});
                group.push({x: Math.round(p1.position.x), y: Math.round(p1.position.y)});
                group.push({x: Math.round(p2.position.x), y: Math.round(p2.position.y)});
                group.push({x: Math.round(p3.position.x), y: Math.round(p3.position.y)});
                distances.push(this._getBezierLength(group[0], group[1],group[2],group[3]))
                groups.push(group);
            }
        }
    
        const pathData = {
            id: 1,
            style: this.isLineMode ? 1 : 2,
            type: 1,
            points: groups
        };

        if(distances.length > 0) {
            pathData["distances"] = distances;
        }
    
        console.log(JSON.stringify(pathData, null, 2));
    }
    private _getBezierLength(p0: cc.Vec2, p1: cc.Vec2, p2: cc.Vec2, p3: cc.Vec2): number {
        const steps = 30; // 减少采样点数量以提高性能
        let length = 0;
        let lastPoint = p0;

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const point = this._getBezierPoint(cc.v3(p0), cc.v3(p1), cc.v3(p2), cc.v3(p3), t);
            const currentPoint = cc.v2(point.x, point.y);
            length += currentPoint.sub(lastPoint).mag();
            lastPoint = currentPoint;
        }
        return Math.round(length);
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

