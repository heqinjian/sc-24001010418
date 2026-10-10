# PrintHub 测试说明

## 工具

- 后端：Node.js 内置测试运行器 `node:test` + `node:assert`，无额外依赖。
- 前端：以 `vite build` 生产构建作为编译/集成验证。

## 运行命令

```bash
# 后端全部测试（串行，避免共享 SQLite 文件竞争）
npm --prefix backend test
# 等价于在 backend/ 下：node --test --test-concurrency=1

# 单个测试文件
cd backend
node --test tests/orders.test.js

# 前端生产构建
npm --prefix frontend run build
```

## 覆盖范围

| 文件 | 覆盖内容 |
|---|---|
| `tests/smoke.test.js` | 健康检查、404 响应信封 |
| `tests/products.test.js` | 分类、商品列表/分页、关键词搜索、分类筛选、价格排序、参数校验、详情、404 |
| `tests/auth.test.js` | 注册、重复注册 409、错误密码 401、登录 + me、未登录 401、校验 |
| `tests/orders.test.js` | 下单、库存扣减、超库存 409、未登录 401、跨用户隔离、收货信息校验 |
| `tests/admin.test.js` | 管理员商品增改下架、非法参数 400、普通用户 403、订单状态修改 |

## 说明与限制

- 测试复用开发库，`seedIfEmpty` 幂等，不会重复插入商品。
- 每次下单测试会真实扣减少量库存；这是演示库，可删除 `backend/data/` 后重启自动重建。
- 前端交互（点击、弹窗）未配置浏览器自动化测试，以构建通过 + 后端契约测试保证。
