# PRODUCT.md — SaaS-Class 课程与营期管理平台

## Product
SaaS-Class 是一个面向教育培训机构的课程与营期管理 SaaS 平台。包含 APP 用户端（学员/讲师/助教三角色）和 PC 管理后台。

## Target Users
- **学员**：浏览课程/营期→报名→支付→签合同→学习→测验→获证
- **讲师**：查看排课/学员进度/分成收入
- **助教**：报名审核/招生管理/答疑/直播协助
- **后台管理员**：课程/营期/证书/交易/分成全流程管理

## Mode
- APP 端：**Operate**（学员完成学习任务，讲师/助教完成运营任务）
- PC 后台：**Operate**（管理员完成课程配置/营期管理/审核操作）

## Visual World
- **风格**：Minimalism & Swiss Style（极简专业风）
- **色板**：Primary #0D9488（teal绿）/ Accent #12B76A / Background #F5F7FA / Foreground #1F2C3E
- **字体**：系统 sans-serif（PingFang SC / Helvetica Neue）
- **圆角**：8-12px（卡片）/ 6px（按钮）
- **阴影**：低对比度阴影 `0 2px 8px rgba(0,0,0,0.06)`
- **间距**：8dp 基准系统（4/8/12/16/24/32/48）
- **动画**：GSAP 入场动画 + 150-300ms 微交互

## Design Tokens
- --color-primary: #0D9488
- --color-primary-light: #E6F9F1
- --color-accent: #12B76A
- --color-bg: #F5F7FA
- --color-surface: #FFFFFF
- --color-text: #1F2C3E
- --color-text-secondary: #667085
- --color-text-muted: #98A2B3
- --color-border: #EAECF0
- --color-danger: #F04438
- --color-warning: #F79009
- --radius-sm: 6px
- --radius-md: 10px
- --radius-lg: 16px
- --shadow-card: 0 2px 8px rgba(0,0,0,0.06)
- --spacing-xs: 4px
- --spacing-sm: 8px
- --spacing-md: 16px
- --spacing-lg: 24px
- --spacing-xl: 32px

## Constraints
- TDesign Vue Next 组件库（PC + APP 共用）
- Vue 3 Composition API + Pinia + Vue Router 4
- 模拟数据驱动（无真实后端接口）
- 直播采用 OBS 推拉流（复用既有系统）
- 本期不做：打卡、会员专享、优惠券、素材中心
