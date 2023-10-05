# hehe-mall-admin
[English introduce](./README.md)

## 推荐的IDE设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## TS 中对 .vue 导入的类型支持

默认情况下，TypeScript 无法处理 `.vue` 导入的类型信息，因此我们将 `tsc` CLI 替换为 `vue-tsc` 以进行类型检查。 在编辑器中，我们需要 [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) 来让 TypeScript 语言服务识别 .vue 类型。

如果您觉得独立的 TypeScript 插件不够快，Volar 还实现了性能更高的[接管模式](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669)。 您可以通过以下步骤启用它：

1. 禁用内置的 TypeScript 扩展
    1) 从VSCode的命令面板运行 `Extensions: Show Built-in Extensions`
    2) 找到 `TypeScript and JavaScript Language Features`，右键单击并选择 `Disable (Workspace)`
2. 通过从命令面板运行 `Developer: Reload window` 来重新加载VSCode窗口。

## 自定义配置

参见 [Vite 配置参考](https://vitejs.dev/config/)。

## 项目启动依赖安装

```sh
npm install
#or
yarn install
```

### 编译和热重载开发

```sh
npm run serve
#or
npm run dev
#or
yarn serve
#or
yarn dev
```

### 类型检查、编译和压缩打包到生产模式

```sh
npm run build-with-check
#or
yarn build-with-check
```

### 编译和压缩打包到生产模式

```sh
npm run build
#or
npm run build:prod
#or
yarn build
#or
yarn build:prod
```

### 编译和压缩打包到stage模式

```sh
npm run build:stage
#or
yarn build:stage
```
其他模式的编译打包, 可以在 [package.json](./package.json)的 `script` 部分进行配置。

### 使用 [Vitest](https://vitest.dev/) 进行单元测试

```sh
npm run test:unit
#or
yarn test:unit
```

### 使用 [ESLint](https://eslint.org/) 进行语法格式检查

```sh
npm run lint
#or
yarn lint
```
