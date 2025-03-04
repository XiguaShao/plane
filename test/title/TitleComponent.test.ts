import TitleComponent from '../../assets/scripts/title/TitleComponent';
import { TestUtil } from '../test_tool/TestUtil';

describe('TitleComponent', () => {
    let titleComponent: TitleComponent;
    let mockLabel: cc.Label;

    beforeEach(() => {
        // 使用 TestUtil 创建组件
        titleComponent = TestUtil.createComponent(TitleComponent);
        mockLabel = TestUtil.createComponent(cc.Label);
        titleComponent.labelTitle = mockLabel;
    });

    test('setTitle should update label string', () => {
        const testTitle = '测试标题';
        titleComponent.setTitle(testTitle);
        expect(titleComponent.labelTitle?.string).toBe(testTitle);
    });

    test('setTitle should handle null label', () => {
        titleComponent.labelTitle = null;
        titleComponent.setTitle('测试标题');
        // 确保不会抛出错误
        expect(true).toBe(true);
    });
});