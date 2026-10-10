# PrintHub — 3D 打印商城

PrintHub 是一个面向高校 Web 架构课程的**前后端分离全栈演示项目**，参考 [MatterHackers](https://www.matterhackers.com/) 的商品组织方式，销售 3D 打印机、打印耗材、打印配件与 3D 扫描设备。

## 主要功能

- 商城首页：导航、搜索、Banner、分类入口、热门推荐、页脚
- 商品列表：关键词搜索、分类筛选、价格升降序、分页、库存状态、无结果/失败提示
- 商品详情：图片、价格、分类、描述、规格、库存、数量选择、加入购物车
- 购物车：加购/改数量/删除、小计与合计、localStorage 持久化、空态
- 用户认证：注册、登录、退出，scrypt 密码哈希、JWT 令牌、路由守卫
- 结算下单：后端重查价格与库存、数据库事务、整单库存校验、扣减库存、订单快照
- 我的订单：订单列表与详情，用户数据隔离
- 后台管理（管理员）：商品新增/编辑/下架/库存、全部订单、订单状态修改，后端权限校验

## 技术栈

- **前端**：Vue 3 + Vite + Vue Router + Pinia + Axios + Element Plus（Composition API / `<script setup>`），端口 5173
- **后端**：Node.js + Express，RESTful API，JWT 认证，端口 3000
- **数据库**：SQLite（Node 22 内置 `node:sqlite`，零原生编译依赖）
- **测试**：Node 内置 `node:test`

> 数据库说明：任务书技术栈一节曾写 "mysql"，但架构图、环境变量示例与各阶段验收标准均指定 SQLite；本机无 MySQL 服务，为保证一键运行统一采用 SQLite。切换 MySQL 仅需替换 `backend/src/database/` 实现。

## 目录结构

```
printhub/
├── frontend/
│   └── src/
│       ├── api/          # axios 客户端与各业务接口
│       ├── components/   # 导航、页脚、Banner、商品卡片等
│       ├── layouts/      # MainLayout / AdminLayout
│       ├── router/       # 路由与守卫
│       ├── stores/       # Pinia：cart / auth
│       └── views/        # 页面 + views/admin/
├── backend/
│   ├── scripts/          # setup-admin.js 管理员初始化
│   ├── src/
│   │   ├── config/       # 配置与 .env 加载
│   │   ├── database/     # 连接、建表、seed
│   │   ├── middleware/   # 错误处理、auth/admin 鉴权
│   │   ├── routes/       # products/categories/auth/orders/admin
│   │   └── utils/        # 密码哈希、JWT
│   ├── tests/            # node:test 测试
│   ├── server.js
│   └── package.json
├── docs/                 # API.md / DATABASE.md / TESTING.md
├── package.json
├── .env.example
└── .gitignore
```

## 环境要求

- Node.js **>= 22.5**（需内置 `node:sqlite`）
- npm >= 10
- Git

## 快速开始

```bash
# 1. 安装依赖（前后端分别安装）
npm run install:all

# 2. 配置后端环境变量
cd backend
copy .env.example .env
#   编辑 .env，把 JWT_SECRET 改成一段足够长的随机字符串

# 3. 启动后端（http://localhost:3000）
npm run dev:backend

# 4. 另开一个终端，启动前端（http://localhost:5173）
npm run dev:frontend
```

打开 http://localhost:5173 即可。首次启动后端会自动建表并写入演示分类与商品（幂等）。

## 演示账号

- 普通用户：直接在页面“注册”即可，密码经 scrypt 哈希存储。
- 管理员：通过安全的本地脚本创建，**密码不写死在代码里**：

```powershell
cd backend
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="你的强密码"
node scripts/setup-admin.js
```

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run dev:frontend` | 前端开发服务器 |
| `npm run dev:backend` | 后端开发（node --watch） |
| `npm run build:frontend` | 前端生产构建 |
| `npm run start:backend` | 后端生产启动 |
| `npm run test:backend` | 后端自动化测试 |

## 文档

- API 文档：[docs/API.md](docs/API.md)
- 数据库设计：[docs/DATABASE.md](docs/DATABASE.md)
- 测试说明：[docs/TESTING.md](docs/TESTING.md)

## 简化范围与已知限制

- 无真实支付、短信验证、物流追踪与第三方登录；下单后状态由管理员手动流转。
- 商品图片当前使用占位图（未抓取受版权保护的商品图）。
- 前端未配置浏览器自动化测试，以生产构建 + 后端契约测试保证质量。
- 金额使用 REAL 存储并在计算时四舍五入到分，满足演示精度。

## 仓库

https://github.com/heqinjian/sc-24001010418
