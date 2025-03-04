

export class TestUtil {
    /**
     * 创建组件实例
     */
    static createComponent<T extends cc.Component>(ComponentClass: new () => T): T {
        const component = new ComponentClass();
        const node = this.createNode();
        component.node = node;
        return component;
    }

    /**
     * 创建节点实例
     */
    static createNode(options: Partial<cc.Node> = {}): cc.Node {
        const node = new cc.Node();
        Object.assign(node, options);
        return node;
    }

    /**
     * 创建标签组件
     */
    static createLabel(text: string = ''): cc.Label {
        const label = this.createComponent(cc.Label);
        label.string = text;
        return label;
    }

    /**
     * 等待指定时间
     */
    static async wait(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}