# Stando - 功能需求文档

## 1. 概述

Stando 是一款 VSCode 插件，旨在帮助长时间使用电脑的用户定时提醒站立休息，预防久坐带来的健康问题。

> **Stando** = **Stand** + **Do** - Stand up and do it!

## 2. 核心功能

### 2.1 定时提醒
- 按用户设定的时间间隔（默认 60 分钟）弹出通知
- 通知包含自定义提醒消息和操作按钮
- 支持「已站立」「稍后提醒 5 分钟」「忽略」三种响应方式

### 2.2 状态栏显示
支持四种显示模式，用户可在设置中自由切换：

| 模式 | 说明 | 示例 |
|------|------|------|
| countdown | 倒计时模式 | `⏱ 45:30` |
| progress | 进度条模式 | `🧍 ████░░░░` |
| lastTime | 上次站立时间 | `📜 Last: 14:30` |
| silent | 静默模式 | `🧍` (仅图标) |

### 2.3 站立确认机制
1. 提醒弹出 → 用户点击「已站立」
2. 进入站立状态 → 状态栏显示站立计时
3. 用户点击状态栏 → 结束站立，记录时长，重新开始倒计时

## 3. 扩展功能

### 3.1 暂停/恢复
- 支持临时暂停提醒功能
- 暂停期间状态栏显示「⏸ Paused」
- 可通过命令或点击状态栏菜单恢复

### 3.2 勿扰模式
- 支持设置勿扰时间段（如午休 12:00-13:00）
- 勿扰期间不弹出提醒通知
- 支持跨午夜时间段（如 22:00-06:00）

### 3.3 统计功能
点击状态栏可查看今日统计数据：
- 站立次数
- 平均每次站立时间
- 今日站立总时间
- 今日坐着工作总时间
- 当前状态（站立中/坐着）

### 3.4 数据持久化
- 统计数据自动保存
- 保留最近 7 天的历史记录
- 自动清理过期数据

## 4. 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `stando.interval` | number | 60 | 提醒间隔（分钟），范围 1-480 |
| `stando.displayMode` | string | silent | 状态栏显示模式 |
| `stando.message` | string | Time to stand up and stretch! | 提醒消息文字 |
| `stando.dndEnabled` | boolean | false | 是否启用勿扰模式 |
| `stando.dndStartTime` | string | 12:00 | 勿扰开始时间 (HH:MM) |
| `stando.dndEndTime` | string | 13:00 | 勿扰结束时间 (HH:MM) |

## 5. 命令列表

| 命令 | 快捷操作 | 说明 |
|------|----------|------|
| `Stando: Pause` | `Ctrl+Shift+P` → 输入命令 | 暂停提醒 |
| `Stando: Resume` | `Ctrl+Shift+P` → 输入命令 | 恢复提醒 |
| `Stando: Stand Up` | `Ctrl+Shift+P` → 输入命令 | 开始站立 |
| `Stando: Sit Down` | `Ctrl+Shift+P` → 输入命令 | 结束站立 |
| `Stando: Show Statistics` | `Ctrl+Shift+P` → 输入命令 | 显示统计数据 |

## 6. 使用指南

### 6.1 激活插件
插件安装后，**重新加载 VSCode 窗口**即可激活：
- 按 `Ctrl+Shift+P`
- 输入 `Reload Window` 并执行

### 6.2 状态栏交互
- 右下角会显示一个小人图标
- **点击状态栏**弹出快捷菜单：
  - 查看统计
  - 暂停/恢复提醒
  - 立即站立
- 站立状态下点击状态栏可结束站立

### 6.3 修改设置
1. 打开设置：`File` → `Preferences` → `Settings`
2. 搜索 `stando`
3. 根据需要修改各项配置

## 7. 用户交互流程

```
┌─────────────────────────────────────────────────────────┐
│                      插件启动                            │
│                         ↓                               │
│              开始倒计时（默认 60 分钟）                    │
│                         ↓                               │
│   ┌─────────────────────────────────────────────────┐   │
│   │              倒计时结束                          │   │
│   │                  ↓                              │   │
│   │    检查: 是否暂停? 是否勿扰时段? 是否已站立?      │   │
│   │                  ↓                              │   │
│   │         [否] 弹出提醒通知                        │   │
│   │              ↓         ↓           ↓           │   │
│   │         [已站立]  [稍后5分钟]    [忽略]          │   │
│   │              ↓         ↓           ↓           │   │
│   │         开始站立   5分钟后重试   重新倒计时       │   │
│   │         计时         │              │           │   │
│   │              ↓       │              │           │   │
│   │      点击状态栏结束站立              │           │   │
│   │              ↓                      │           │   │
│   │         记录统计数据 ←──────────────┘           │   │
│   │              ↓                                  │   │
│   │         重新开始倒计时 ─────────────→ 循环      │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 8. 数据结构

### 8.1 每日统计 (DailyStats)
```typescript
interface DailyStats {
  date: string;              // 日期 YYYY-MM-DD
  standCount: number;        // 站立次数
  totalStandTime: number;    // 站立总时间（秒）
  totalSitTime: number;      // 坐着总时间（秒）
  standRecords: StandRecord[]; // 站立记录详情
}
```

### 8.2 站立记录 (StandRecord)
```typescript
interface StandRecord {
  startTime: number;   // 站立开始时间戳
  endTime: number;     // 站立结束时间戳
  duration: number;    // 持续时间（秒）
}
```

### 8.3 持久化数据 (StorageData)
```typescript
interface StorageData {
  dailyStats: DailyStats[];        // 最近 7 天的统计数据
  currentState: 'sitting' | 'standing';
  currentStandStart?: number;      // 当前站立开始时间
  lastReminderTime?: number;       // 上次提醒时间
  isPaused: boolean;               // 是否暂停
  sessionStartTime?: number;       // 当前坐着开始时间
}
```

## 9. 技术规格

- **运行环境**: VSCode 1.74.0+
- **开发语言**: TypeScript
- **打包工具**: esbuild
- **激活方式**: VSCode 启动后自动激活

## 10. 项目结构

```
stando/
├── package.json          # 插件配置、命令定义、配置项声明
├── tsconfig.json         # TypeScript 配置
├── esbuild.js            # 打包脚本
├── .vscodeignore         # 打包忽略文件
├── .gitignore            # Git 忽略文件
├── doc/                  # 文档目录
│   ├── requirements.md   # 功能需求文档
│   └── build.md          # 编译构建文档
├── src/
│   ├── extension.ts      # 插件入口
│   ├── reminder.ts       # 提醒定时器逻辑
│   ├── statusBar.ts      # 状态栏管理（四种显示模式）
│   ├── statistics.ts     # 统计数据计算
│   ├── storage.ts        # 数据持久化
│   └── types.ts          # 类型定义
└── dist/
    └── extension.js      # 打包输出
```
