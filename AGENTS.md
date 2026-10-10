# AGENTS.md — PrintHub 开发执行规范摘要

本文件面向后续 AI Agent / 协作者，完整需求见 `agent.md`（项目总工作书）。

## 硬约束

1. 仓库：https://github.com/heqinjian/sc-24001010418.git ，分支 `main`，禁止 force push。
2. 至少 9 个真实阶段提交（S1–S9），每个阶段：写代码 → 测试 → diff 检查 → 选择性 add → 独立 commit → push → 用 `git ls-remote origin refs/heads/main` 核验远程哈希。
3. 禁止 `--allow-empty`、禁止一次性写完再拆提交、禁止伪造测试/提交/推送结果。
4. 禁止提交 `.env`、真实密钥、token、node_modules、data/、dist/。
5. SQL 全部参数化；后端不信任客户端提交的价格/库存/角色/订单金额。
6. 密码必须哈希存储；管理员权限必须在后端校验。

## 技术栈速查

- 前端 Vue3 + Vite + Pinia + Vue Router + Axios + Element Plus，端口 5173。
- 后端 Express，端口 3000，API 前缀 `/api`。
- 数据库 SQLite（Node 22 内置 `node:sqlite`），文件路径由 `DATABASE_PATH` 配置。
- 统一响应：`{ success, data, message }` / `{ success, message, code }`。

## 阶段清单

- S1 项目初始化（骨架、前后端可构建/可启动）
- S2 首页与基础视觉
- S3 数据库、商品与分类 API
- S4 商品详情
- S5 购物车
- S6 用户认证（JWT）
- S7 结算与订单（事务）
- S8 后台管理
- S9 测试、修复与文档

## 常见坑

- Windows 环境用 PowerShell，不要用 Bash 工具。
- npm 全局 prefix 配置可能有 warning，不影响安装。
- 推送失败时区分"本地已提交"与"远程未验证"，不得谎称已推送。
