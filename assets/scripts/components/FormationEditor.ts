const { ccclass, property } = cc._decorator;

@ccclass
export default class FormationEditor extends cc.Component {
    @property(cc.Color)
    normalColor: cc.Color = new cc.Color(100, 100, 100, 255);

    @property(cc.Color)
    selectedColor: cc.Color = new cc.Color(0, 255, 0, 255);

    @property
    rows: number = 4;

    @property
    cols: number = 7;

    @property
    cellSize: number = 102;

    @property(cc.Button)
    resetButton: cc.Button | null = null;

    @property(cc.Button)
    exportButton: cc.Button | null = null;

    private cells: cc.Node[] = [];
    private selectedIndexes: Set<number> = new Set();

    onLoad(): void {
        this._initGrid();
        this._initButtons();
    }

    private _initGrid(): void {
        const startX = -((this.cols * this.cellSize) / 2) + this.cellSize / 2;
        const startY = cc.winSize.height / 2 - this.cellSize * 1.5;
    
        let index = 1;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = new cc.Node();
                // 设置大小
                cell.width = this.cellSize;
                cell.height = this.cellSize;
                const sprite = cell.addComponent(cc.Sprite);
                
                // 创建一个纯色精灵
                const texture = new cc.Texture2D();

                // 生成纯色纹理
                let color = this.normalColor; // 设置颜色值
                let buffer = new Uint8Array([color.getR(), color.getG(), color.getB(), 255]); // RGBA 数据
                texture.initWithData(buffer, cc.Texture2D.PixelFormat.RGBA8888, 1, 1);

                // 应用纹理
                sprite.spriteFrame = new cc.SpriteFrame(texture);
                // 设置属性
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                cell.setContentSize(this.cellSize, this.cellSize);
                cell.color = color;
                
                cell.x = startX + col * this.cellSize;
                cell.y = startY - row * this.cellSize;
                this.node.addChild(cell);
     
    
                // 添加序号标签
                const label = new cc.Node();
                const labelComp = label.addComponent(cc.Label);
                labelComp.string = index.toString();
                labelComp.fontSize = 30;
                label.parent = cell;
    
                // 添加点击事件
                // 修改点击事件绑定
                const currentIndex = index;  // 保存当前索引
                cell.addComponent(cc.Button);  // 添加按钮组件使节点可点击
                cell.on(cc.Node.EventType.TOUCH_START, () => {
                    this._onCellClick(currentIndex, sprite);
                }, this);
                // 移除多余的 TOUCH_END 事件
                
                this.cells.push(cell);
                index++;
            }
        }
    }
    
    private _onCellClick(index: number, sprite: cc.Sprite): void {
        if (this.selectedIndexes.has(index)) {
            this.selectedIndexes.delete(index);
            this._updateSpriteColor(sprite, this.normalColor);
        } else {
            this.selectedIndexes.add(index);
            this._updateSpriteColor(sprite, this.selectedColor);
        }
    }
    
    private _updateSpriteColor(sprite: cc.Sprite, color: cc.Color): void {
        const texture = new cc.Texture2D();
        const buffer = new Uint8Array(4);
        buffer[0] = color.r;
        buffer[1] = color.g;
        buffer[2] = color.b;
        buffer[3] = color.a;
        texture.initWithData(buffer, cc.Texture2D.PixelFormat.RGBA8888, 1, 1);
        sprite.spriteFrame.setTexture(texture);
        sprite.node.color = color;
    }
    
    private _onReset(): void {
        this.selectedIndexes.clear();
        this.cells.forEach(cell => {
            const sprite = cell.getComponent(cc.Sprite);
            if (sprite) {
                this._updateSpriteColor(sprite, this.normalColor);
            }
        });
    }
    
    private _onExport(): void {
        const result = {
            id: 1,
            col: this.cols,
            row: this.rows,
            indexs: Array.from(this.selectedIndexes).sort((a, b) => a - b)
        };
        console.log(JSON.stringify(result, null, 2));
    }
    
    private _initButtons(): void {
        if (this.resetButton) {
            this.resetButton.node.on('click', this._onReset, this);
        }
        if (this.exportButton) {
            this.exportButton.node.on('click', this._onExport, this);
        }
    }
}