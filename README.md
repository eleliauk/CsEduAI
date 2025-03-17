# CSEduAI - 基于大模型的计算机专业辅助教学平台

CSEduAI 是一个基于 React 的代码分析工具，它能帮助开发者更好地理解和分析代码。通过集成 AI 能力，CSEduAI 可以智能地回答关于代码的问题，提取代码中的技术特性，并提供深入的代码分析。

## 主要特性

### 1. 智能代码分析
- 支持选中代码文本进行 AI 分析
- 可以向 AI 提问关于代码的问题
- 自动提取代码中的技术特点和功能点

### 2. 用户界面
- 现代化的界面设计
- 支持亮色/暗色主题切换
- 支持蓝色/黄色两种主题配色
- 流畅的动画效果

### 3. 交互功能
- 课程管理
- 课程学习，支持视频播放，文本阅读，代码阅读，代码分析，代码练习
- 文本选择工具栏
- AI 分析对话框
- 代码分享功能

## 技术栈

- **前端框架**: React 18
- **路由**: @tanstack/react-router (文件系统路由)
- **状态管理**: Zustand
- **UI组件**: 
  - Shadcn UI
  - Tailwind CSS
  - Lucide React (图标)
- **动画**: Motion
- **工具库**:
  - Axios (HTTP 请求)
  - React Query
  - React Hook Form
  - Zod (类型验证)

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # React 组件
│   ├── common/     # 通用组件
│   ├── theme/      # 主题相关组件
│   └── ui/         # UI 基础组件
└── lib/           # 工具函数和配置
```

## 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建项目
pnpm run build

# 预览构建结果
pnpm run preview
```

## 主要功能模块

### AI 分析对话框
- 支持实时显示 AI 思考过程
- 可以复制和重新生成分析结果
- 支持用户提问

### 文本选择工具栏
- 智能定位在选中文本附近
- 提供快捷操作按钮
- 支持多种分析模式

### 主题切换
- 支持亮色/暗色模式
- 支持蓝色/黄色主题配色
- 主题切换带有平滑过渡效果

## 许可证

本项目使用的头像资源来自：
- Adventurer by Lisa Wischofsky (CC BY 4.0)
- Lorelei by Lisa Wischofsky (CC0 1.0)
- Notionists by Zoish (CC0 1.0)
```

