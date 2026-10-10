# PrintHub — 3D 打印商城

PrintHub 是一个面向高校 Web 架构课程的前后端分离全栈演示项目，参考 [MatterHackers](https://www.matterhackers.com/) 的商品组织方式，销售 3D 打印机、耗材、配件与扫描设备。

> 本 README 随开发阶段持续完善。当前为 **S1 项目初始化** 版本。

## 技术栈

- **前端**：Vue 3 + Vite + Vue Router + Pinia + Axios + Element Plus（Composition API / `<script setup>`）
- **后端**：Node.js + Express（RESTful API，JWT 认证）
- **数据库**：SQLite（使用 Node.js 22 内置 `node:sqlite`，零原生编译依赖）
- **工程**：npm workspaces、Git、ESLint 可选

> 数据库说明：任务书技术栈一节曾写 "mysql"，但架构图、环境变量示例与各阶段验收标准均指定 SQLite；本机无 MySQL 服务，为保证项目可一键运行，统一采用 SQLite。如需切换 MySQL，仅需替换 `backend/src/database/` 下的实现。

## 目录结构

```
printhub/
├── frontend/          # Vue 3 + Vite 前端
├── backend/           # Express 后端 API
├── docs/             # API / 数据库 / 设计文档（后续阶段补充）
├── scripts/          # 初始化脚本（后续阶段补充）
├── package.json      # 根 workspace
├── .env.example      # 环境变量示例
├── .gitignore
└── AGENTS.md         # Agent 执行规范摘要
```

## 环境要求

- Node.js >= 22.5（需内置 `node:sqlite`）
- npm >= 10
- Git

## 快速开始

```bash
# 1. 安装依赖（根目录，会同时安装前后端 workspace）
npm install

# 2. 配置环境变量
cd backend
cp .env.example .env   # Windows: copy .env.example .env
# 编辑 .env，设置 JWT_SECRET 等本地值

# 3. 启动后端（默认 http://localhost:3000）
npm run dev -w backend

# 4. 启动前端（默认 http://localhost:5173）
npm run dev -w frontend
```

## 启动与构建命令

| 命令 | 作用 |
|---|---|
| `npm run build -w frontend` | 前端生产构建 |
| `npm start -w backend` | 后端生产启动 |
| `npm run dev -w backend` | 后端开发启动（node --watch） |
| `npm run dev -w frontend` | 前端开发服务器 |
| `npm test -w backend` | 后端自动化测试 |

## 已知限制

- 简化演示：无真实支付、无短信、无物流追踪。
- 订单库存扣减在 S7 以数据库事务实现。
- 演示账号由初始化脚本在本地创建，不提交真实密码。

## 仓库

https://github.com/heqinjian/sc-24001010418
