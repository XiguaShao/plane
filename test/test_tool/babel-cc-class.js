module.exports = function() {
    return {
        visitor: {
            CallExpression(path) {
                if (path.node.callee.object && 
                    path.node.callee.object.name === 'cc' && 
                    path.node.callee.property.name === 'Class') {
                    
                    const classConfig = path.node.arguments[0];
                    if (!classConfig) return;

                    // 获取继承的类
                    const extendsClass = classConfig.properties.find(
                        prop => prop.key.name === 'extends'
                    );
                    const superClass = extendsClass ? extendsClass.value : null;

                    // 获取属性定义
                    const properties = classConfig.properties.find(
                        prop => prop.key.name === 'properties'
                    );

                    // 创建类声明
                    const classDeclaration = path.scope.generateUidIdentifier('CCClass');
                    const body = [];

                    // 添加构造函数
                    body.push(path.scope.generateUidIdentifier('constructor'));

                    // 转换为标准的类声明
                    path.replaceWith(
                        path.scope.generateUidIdentifier('class'),
                        {
                            id: classDeclaration,
                            superClass: superClass,
                            body: body
                        }
                    );
                }
            }
        }
    };
};