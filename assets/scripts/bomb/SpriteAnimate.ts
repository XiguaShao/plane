const { ccclass, property } = cc._decorator;

@ccclass
export default class SpriteAnimate extends cc.Component {
    @property([cc.SpriteFrame])
    Frams: cc.SpriteFrame[] = [];

    @property
    autoPlay: boolean = false;

    @property
    delayTime: number = 0.15;

    @property
    repeat: number = -1;

    @property
    autoRemove: boolean = false;

    private runtime: number = 0;
    private isRun: boolean = false;
    private index: number = -1;
    private sprite: cc.Sprite = null;
    private endCB: Function | null = null;

    onLoad() {
        this.runtime = 0;
        this.isRun = false;
        this.index = -1;
        this.sprite = this.node.getComponent(cc.Sprite);
        this.loadstart();
    }

    start() {}

    loadstart() {
        if (this.autoPlay && this.Frams.length > 0) {
            this.startAnimate(this.repeat, () => {
                if (this.autoRemove) {
                    this.node.destroy();
                }
            });
        }
    }

    loadFrames(atlas: any, name: string, begin: number, end: number) {
        this.Frams = [];
        for (let i = begin; i < end; i++) {
            this.Frams.push(atlas.getSpriteFrame(name + i));
        }
    }

    startAnimate(repeat: number = -1, cb?: Function) {
        this.endCB = this.endCB || cb || null;
        this.reset();
        this.isRun = true;
        this.repeat = repeat;
    }

    setDelayTime(time: number) {
        this.delayTime = time;
        this.runtime = this.delayTime;
    }

    setEndCB(cb: Function) {
        this.endCB = cb;
    }
    
    reset() {
        this.index = -1;
    }

    private updateFrame() {
        this.index = (this.index + 1) % this.Frams.length;
        
        if (this.index === 0) {
            if (this.repeat === 0) {
                this.endCB && this.endCB();
                if (this.autoRemove) {
                    this.node.destroy();
                }
                return;
            }
            if (this.repeat > 0) {
                this.repeat--;
            }
        }
        this.sprite.spriteFrame = this.Frams[this.index];
    }

    update(dt: number) {
        if (!this.isRun) return;

        if (this.runtime < 0) {
            this.runtime = this.delayTime;
            this.updateFrame();
            return;
        }
        this.runtime -= dt;
    }
}