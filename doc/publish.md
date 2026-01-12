# VSCode 插件发布指南

本文档记录将 Stando 插件发布到 Visual Studio Marketplace 的完整流程。

## 前置条件

- Node.js 16.0.0 或更高版本
- npm 8.0.0 或更高版本
- Microsoft 账号

## 发布流程

### 1. 创建 Publisher

1. 访问 https://marketplace.visualstudio.com/manage/createpublisher
2. 使用 Microsoft 账号登录
3. 填写 Publisher 信息：
   - **Name**: 显示名称（如 `Ying Zhang`）
   - **ID**: 唯一标识符（如 `yingzhang`），必须与 package.json 中的 `publisher` 字段一致
4. 其他字段可选填或留空
5. 点击 **Create** 按钮

### 2. 确保 package.json 配置正确

```json
{
  "name": "stando",
  "displayName": "Stando",
  "publisher": "yingzhang",
  "version": "1.0.0",
  "icon": "images/stando.png",
  ...
}
```

关键字段：
- `publisher`: 必须与 Marketplace 上创建的 Publisher ID 一致
- `icon`: 插件图标路径
- `repository`: GitHub 仓库地址

### 3. 打包插件

```bash
cd /path/to/stando
npm run package
```

打包成功后会生成 `stando-1.0.0.vsix` 文件。

### 4. 上传插件

#### 方法一：网页上传（推荐）

1. 访问 https://marketplace.visualstudio.com/manage/publishers/yingzhang
2. 点击 **+ New extension** 按钮
3. 选择 **Visual Studio Code**
4. 上传生成的 `.vsix` 文件
5. 等待验证完成（通常 2-5 分钟）

#### 方法二：命令行上传

1. 创建 Personal Access Token (PAT)：
   - 访问 https://dev.azure.com
   - 点击右上角头像 → Personal access tokens
   - 点击 **+ New Token**
   - 设置 Scopes: Marketplace → Manage
   - 创建并保存 Token

2. 使用 vsce 发布：
```bash
npx vsce login yingzhang
# 输入 PAT Token
npx vsce publish
```

### 5. 验证发布结果

1. 在 VSCode 中按 `Ctrl+Shift+X` 打开扩展面板
2. 搜索 `Stando`
3. 确认插件显示正确并可安装

插件页面地址：
```
https://marketplace.visualstudio.com/items?itemName=yingzhang.stando
```

## 更新插件版本

1. 修改 package.json 中的 `version` 字段
2. 重新打包：`npm run package`
3. 上传新的 `.vsix` 文件或使用 `npx vsce publish`

## 常见问题

### Q1: Create 按钮点击无反应
- 尝试换浏览器（推荐 Firefox）
- 检查 Publisher ID 是否已被占用
- 打开开发者工具查看 Console 错误

### Q2: 发布失败提示 publisher 不匹配
确保 package.json 中的 `publisher` 字段与 Marketplace 上的 Publisher ID 完全一致。

### Q3: 验证时间过长
通常验证需要 2-5 分钟，如果超过 10 分钟可刷新页面查看状态或联系 Microsoft 支持。
