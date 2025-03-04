const { ccclass, property } = cc._decorator;

@ccclass
export default class TitleComponent extends cc.Component {
    @property(cc.Label)
    labelTitle: cc.Label | null = null;

    setTitle(title: string): void {
        if (!this.labelTitle) return;
        this.labelTitle.string = title;
    }
}