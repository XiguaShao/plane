export class Grid{
    x = 0;
    y = 0;
    f = 0;
    g = 0;
    h = 0;
    parent = null;
    type = 0; // -1障碍物， 0正常， 1起点， 2目的点
}

/**
 * A* 
 * 
 * 1.初始化initmap
 * 2.设置起点
 * 3.设置终点
 * 4.设置障碍
 * 5.开始寻路
 * 
 */
export default class AStart{
    /** 单例 */
    public static readonly Instance: AStart = new AStart();

    private mapH = 13;     // 纵向格子数量
    private mapW = 24;     // 横向格子数量

    private is8dir = true; // 是否8方向寻路

    private startX = 0;
    private startY = 0;
    private endX = 0;
    private endY = 0;

    private openList:Grid[] = [];
    private closeList:Grid[] = [];
    private path:Grid[] = [];
    private gridsList:Grid[][] = [] ;

    private constructor() {

    }

    /**初始数据 */
    InitMap(map:{_mapW:number,_mapH:number}){

        this.openList = [];
        this.closeList = [];
        this.path = [];

        this.mapH = map._mapH;
        this.mapW = map._mapW;

        // 初始化格子二维数组
        this.gridsList = new Array(this.mapW + 1);
        for (let col=0;col<this.gridsList.length; col++){
            this.gridsList[col] = new Array(this.mapH + 1);
        }

        for (let col=0; col<= this.mapW; col++){
            for (let row=0; row<=this.mapH; row++){
                this.AddGrid(col, row, 0);
            }
        }

        // 设置起点和终点
        
        
    }

    /**
     * 设置起点
     * @param point 起点位置
     */
    SetStartPoint(point:{x:number,y:number})
    {
        if(point){
            this.startX = point.x;this.startY = point.y;
        }
        console.log("设置起点");
        console.log(point);
        
        this.gridsList[this.startX][this.startY].type = 1;
    }

    /**
     * 设置终点
     * @param point 终点位置
     */
    SetTargetPoint(point:{x:number,y:number})
    {

        this.endX = this.mapH ;
        this.endY = this.mapW ;
        if(point){
            this.endX = point.x;this.endY = point.y;
        }
        console.log("设置终点");
        console.log(point);
        this.gridsList[this.endX][this.endY].type = 2;
    }



    AddGrid(x, y, type){
        let grid = new Grid();
        grid.x = x;
        grid.y = y;
        grid.type = type;
        this.gridsList[x][y] = grid;
    }


    /**设置路障 */
    SetMapBarrier(_pos:{x:number,y:number}){
        if (this.gridsList[_pos.x][_pos.y].type == 0){

            this.gridsList[_pos.x][_pos.y].type = -1;
        }
    }

    _sortFunc(x, y){
        return x.f - y.f;
    }

    generatePath(grid){
        this.path.push(grid);
        while (grid.parent){
            grid = grid.parent;
            this.path.push(grid);
        }
        cc.log("path.length: " + this.path.length);
        
        for (let i=0; i<this.path.length; i++){
            // 起点终点不覆盖，方便看效果
            if (i!=0 && i!= this.path.length-1){
                let grid = this.path[i];
            }
        }
    }
    /**开始寻找路径 */
    findPath(){
        let startGrid = this.gridsList[this.startX][this.startY];
        this.openList.push(startGrid);
        let curGrid = this.openList[0];
        while (this.openList.length > 0 && curGrid.type != 2){
            // 每次都取出f值最小的节点进行查找
            curGrid = this.openList[0];
            if (curGrid.type == 2){
                cc.log("find path success.");
                this.generatePath(curGrid);
                return this.path;
            }

            for(let i=-1; i<=1; i++){
                for(let j=-1; j<=1; j++){
                    if (i !=0 || j != 0){
                        let col = curGrid.x + i;
                        let row = curGrid.y + j;
                        if (col >= 0 && row >= 0 && col <= this.mapW && row <= this.mapH
                            && this.gridsList[col][row].type != -1
                            && this.closeList.indexOf(this.gridsList[col][row]) < 0){
                                if (this.is8dir){
                                    // 8方向 斜向走动时要考虑相邻的是不是障碍物
                                    if (this.gridsList[col-i][row].type == -1 || this.gridsList[col][row-j].type == -1){
                                        continue;
                                    }
                                } else {
                                    // 四方形行走
                                    if (Math.abs(i) == Math.abs(j)){
                                        continue;
                                    }
                                }

                                // 计算g值
                                // let g = curGrid.g + parseInt(Math.sqrt(Math.pow(i*10,2) + Math.pow(j*10,2)));
                                let g = curGrid.g + Math.floor(Math.sqrt(Math.pow(i*10,2) + Math.pow(j*10,2)));
                                if (this.gridsList[col][row].g == 0 || this.gridsList[col][row].g > g){
                                    this.gridsList[col][row].g = g;
                                    // 更新父节点
                                    this.gridsList[col][row].parent = curGrid;
                                }
                                // 计算h值 manhattan估算法
                                this.gridsList[col][row].h = Math.abs(this.endX - col) + Math.abs(this.endY - row);
                                // 更新f值
                                this.gridsList[col][row].f = this.gridsList[col][row].g + this.gridsList[col][row].h;
                                // 如果不在开放列表里则添加到开放列表里
                                if (this.openList.indexOf(this.gridsList[col][row]) < 0){
                                    this.openList.push(this.gridsList[col][row]);
                                }
                                // // 重新按照f值排序（升序排列)
                                // this.openList.sort(this._sortFunc);
                        }
                    }
                }
            }
            // 遍历完四周节点后把当前节点加入关闭列表
            this.closeList.push(curGrid);
            // 从开放列表把当前节点移除
            this.openList.splice(this.openList.indexOf(curGrid), 1);
            if (this.openList.length <= 0){
                cc.log("find path failed.");
                return this.path;
            }

            // 重新按照f值排序（升序排列)
            this.openList.sort(this._sortFunc);
        }
    }


}
