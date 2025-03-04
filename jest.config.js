/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',  // 测试代码所运行的环境
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  rootDir: "./test",         // 测试文件所在的目录
  transform: {
    '\\.js$': ['babel-jest', {
      plugins: ['./test/test_tool/babel-cc-class.js'],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
      ]
    }]
  },
  transformIgnorePatterns: [
    'cocos2d-js-for-preview.js',
    "/node_modules/",
  ],
  globals: {                 // 全局属性。如果你的被测试的代码中有使用、定义全局变量，那你应该在这里定义全局属性
    window: {},
    cc: {},
  },
  setupFiles: [
    'jest-canvas-mock', // npm 套件只需要名稱
    '<rootDir>/test_tool/cocos2d-js-for-preview.js',
  ]
};