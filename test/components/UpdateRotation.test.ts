// import UpdateRotation from '../../assets/scripts/components/UpdateRotation';

// describe('UpdateRotation', () => {
//     let updateRotation: UpdateRotation;

//     beforeEach(() => {
//         updateRotation = new UpdateRotation();
//         updateRotation.node = new cc.Node();
//     });

//     test('should update rotation when position changes', () => {
//         // 初始更新
//         updateRotation.update();
//         expect(updateRotation.node.rotation).toBe(0);

//         // 改变位置
//         updateRotation.node.position = cc.v3({ x: 10, y: 10, z: 0 });
//         updateRotation.update();
        
//         // 验证旋转角度
//         expect(updateRotation.node.rotation).toBe(45);
//     });
// });

test("测试Cocos接口", () => {
    expect(cc.js.array.remove([1,2,3], 1)).toBe(true);
    expect(cc.js.array.remove([1,2,3], 4)).toBe(false);
    expect(cc.js.array.remove([1,2,3], 0)).toBe(false);
});