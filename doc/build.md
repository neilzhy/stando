# Stando - 编译构建文档

## 1. 环境要求

- **Node.js**: 16.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **VSCode**: 1.74.0 或更高版本（用于测试和安装）

## 2. 快速开始

### 2.1 克隆代码
```bash
git clone https://github.com/neilzhy/stando.git
cd stando
```

### 2.2 安装依赖
```bash
npm install
```

### 2.3 编译项目
```bash
npm run build
```

### 2.4 打包插件
```bash
npm run package
```

### 2.5 安装到 VSCode
```bash
code --install-extension stando-1.0.1.vsix
```

## 3. 开发命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装项目依赖 |
| `npm run build` | 编译 TypeScript 代码 |
| `npm run watch` | 监听模式，自动重新编译 |
| `npm run package` | 打包生成 .vsix 安装文件 |
| `npm run vscode:prepublish` | 发布前预处理（自动调用 build） |

## 4. 项目结构说明

```
stando/
├── package.json          # 项目配置和依赖声明
├── package-lock.json     # 依赖版本锁定
├── tsconfig.json         # TypeScript 编译配置
├── esbuild.js            # esbuild 打包配置
├── .vscodeignore         # 打包时忽略的文件
├── .gitignore            # Git 忽略的文件
├── src/                  # 源代码目录
│   ├── extension.ts      # 插件入口
│   ├── reminder.ts       # 提醒逻辑
│   ├── statusBar.ts      # 状态栏管理
│   ├── statistics.ts     # 统计功能
│   ├── storage.ts        # 数据存储
│   └── types.ts          # 类型定义
├── dist/                 # 编译输出目录（自动生成）
│   └── extension.js      # 打包后的代码
├── node_modules/         # 依赖包目录（自动生成）
└── *.vsix                # 插件安装包（打包后生成）
```

## 5. 依赖说明

### 5.1 开发依赖
| 依赖 | 版本 | 用途 |
|------|------|------|
| typescript | ^5.0.0 | TypeScript 编译器 |
| esbuild | ^0.19.0 | 快速打包工具 |
| @types/node | ^18.0.0 | Node.js 类型定义 |
| @types/vscode | ^1.74.0 | VSCode API 类型定义 |
| @vscode/vsce | ^2.22.0 | VSCode 插件打包工具 |

### 5.2 运行时依赖
本插件无运行时依赖，所有代码打包为单个文件。

## 6. 编译配置

### 6.1 TypeScript 配置 (tsconfig.json)
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 6.2 esbuild 配置 (esbuild.js)
- 入口文件: `src/extension.ts`
- 输出文件: `dist/extension.js`
- 模块格式: CommonJS
- 平台: Node.js
- 外部依赖: vscode（由 VSCode 运行时提供）

## 7. 开发调试

### 7.1 在 VSCode 中调试
1. 打开项目目录
2. 按 `F5` 启动调试
3. 会打开一个新的 VSCode 窗口（Extension Development Host）
4. 在新窗口中测试插件功能

### 7.2 监听模式开发
```bash
npm run watch
```
修改代码后自动重新编译，配合 VSCode 调试使用。

## 8. 发布流程

### 8.1 本地安装测试
```bash
# 打包
npm run package

# 安装
code --install-extension stando-1.0.1.vsix

# 重新加载 VSCode 窗口
# Ctrl+Shift+P → Reload Window
```

### 8.2 发布到 VSCode Marketplace（可选）
1. 注册 Azure DevOps 账号
2. 创建 Personal Access Token
3. 创建 Publisher
4. 发布插件：
```bash
npx vsce publish
```

## 9. 常见问题

### Q1: npm install 失败
确保 Node.js 版本 >= 16，可使用 nvm 管理 Node.js 版本：
```bash
nvm install 18
nvm use 18
```

### Q2: 编译报错
清理后重新编译：
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Q3: 插件安装后不生效
重新加载 VSCode 窗口：
- 按 `Ctrl+Shift+P`
- 输入 `Reload Window` 并执行

### Q4: 如何卸载插件
```bash
code --uninstall-extension yingzhang.stando
```
或在 VSCode 扩展面板中点击卸载。
