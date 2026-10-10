# PrintHub API 文档

所有接口前缀 `/api`。需要登录的接口要求请求头：`Authorization: Bearer <token>`。

统一响应：

```json
{ "success": true, "data": {}, "message": "操作成功" }
```
```json
{ "success": false, "message": "错误说明", "code": "VALIDATION_ERROR" }
```

列表响应的 `data` 形如：`{ items, total, page, pageSize }`。

## 健康检查

### GET /api/health
无需认证。返回服务状态。

成功 `200`：
```json
{ "success": true, "data": { "service": "printhub-backend", "status": "ok" }, "message": "ok" }
```

## 分类

### GET /api/categories
无需认证。返回全部分类及在售商品数。

成功 `200`：
```json
{ "success": true, "data": { "items": [
  { "id": 1, "name": "3D 打印机", "description": "...", "product_count": 3 }
] }, "message": "ok" }
```

## 商品

### GET /api/products
无需认证。查询参数：

| 参数 | 说明 |
|---|---|
| `keyword` | 名称/描述模糊搜索 |
| `categoryId` | 分类 ID（正整数） |
| `sort` | `asc` / `desc`（按价格） |
| `page` | 页码，默认 1 |
| `pageSize` | 每页数量，默认 12，最大 50 |

成功 `200`：
```json
{ "success": true, "data": {
  "items": [ { "id": 1, "name": "...", "category_id": 1, "category_name": "3D 打印机",
    "price": 2499, "stock": 12, "image_url": "", "description": "...", "specifications": "..." } ],
  "total": 12, "page": 1, "pageSize": 12
}, "message": "ok" }
```

失败：`categoryId` 非法返回 `400 VALIDATION_ERROR`。

### GET /api/products/:id
无需认证。商品详情。

成功 `200` 返回单个商品（含 `status`）。
失败：ID 非法 `400`；不存在 `404 NOT_FOUND`。

### POST /api/products  （管理员）
请求体（JSON）：
```json
{ "name": "新商品", "category_id": 1, "price": 199.0, "stock": 10,
  "image_url": "", "description": "...", "specifications": "..." }
```
成功 `201` 返回创建的商品。
失败：字段校验 `400`；未登录 `401`；非管理员 `403`。

### PUT /api/products/:id  （管理员）
请求体只需包含要修改的字段（与 POST 字段相同）。成功 `200` 返回更新后的商品。
失败：`400 / 401 / 403 / 404`。

### DELETE /api/products/:id  （管理员）
软删除（置为 `off_shelf`），保留订单历史。成功 `200`。
失败：`400 / 401 / 403 / 404`。

## 认证

### POST /api/auth/register
请求体：
```json
{ "username": "alice", "password": "secret123" }
```
用户名 3-20 位字母/数字/下划线；密码 6-64 位。
成功 `201`：
```json
{ "success": true, "data": { "token": "<jwt>", "user": { "id": 1, "username": "alice", "role": "user" } }, "message": "注册成功" }
```
失败：校验 `400`；用户名重复 `409 CONFLICT`。

### POST /api/auth/login
请求体：`{ "username": "alice", "password": "secret123" }`
成功 `200` 返回 `{ token, user }`。
失败：用户名或密码错误 `401 UNAUTHORIZED`。

### GET /api/auth/me  （需登录）
成功 `200` 返回当前用户。失败：未登录/令牌失效 `401`。

## 订单

### POST /api/orders  （需登录）
请求体：
```json
{
  "items": [ { "productId": 1, "quantity": 2 } ],
  "recipient": "何秦剑", "phone": "13800138000", "address": "陕西省汉中市XX路1号"
}
```
后端在事务内重新查询每个商品的价格与库存，计算总金额，写入订单与明细并扣减库存。
成功 `201`：
```json
{ "success": true, "data": { "orderId": 1, "orderNo": "PH20261009AB12CD34", "totalAmount": 4998 }, "message": "下单成功" }
```
失败：
- 收货信息/条目校验：`400`
- 未登录：`401`
- 商品不存在/已下架：`404`
- 库存不足：`409 OUT_OF_STOCK`（整笔订单回滚，不扣任何库存）

### GET /api/orders  （需登录）
返回当前用户的订单列表（不含明细）。成功 `200`。

### GET /api/orders/:id  （需登录）
返回订单及其明细。仅能查看自己的订单，他人订单返回 `404`。

## 管理员订单

### GET /api/admin/orders  （管理员）
返回全部订单（含用户名、商品数、收货信息）。非管理员 `403`。

### PATCH /api/admin/orders/:id/status  （管理员）
请求体：`{ "status": "paid" }`
允许值：`pending / paid / shipped / completed / cancelled`。
成功 `200` 返回更新后的订单。
失败：非法状态 `400`；未登录 `401`；非管理员 `403`；订单不存在 `404`。
