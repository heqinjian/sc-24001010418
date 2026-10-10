# PrintHub 数据库设计

数据库：SQLite，使用 Node 22 内置 `node:sqlite`。文件路径由环境变量 `DATABASE_PATH` 指定（默认 `backend/data/printhub.sqlite`）。

建表脚本：`backend/src/database/index.js`（启动时 `CREATE TABLE IF NOT EXISTS`，可重复执行）。
种子脚本：`backend/src/database/seed.js`（仅当分类表为空时插入，幂等）。

## 表结构

### users 用户
| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | INTEGER | 主键自增 |
| username | TEXT | 非空，唯一 |
| password_hash | TEXT | 非空，scrypt 哈希（`scrypt$salt$hash`） |
| role | TEXT | `user` / `admin`，默认 `user` |
| created_at | TEXT | 默认当前时间 |

### categories 分类
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键 |
| name | TEXT | 非空，唯一 |
| description | TEXT | 说明，默认空串 |

### products 商品
| 字段 | 类型 | 约束/说明 |
|---|---|---|
| id | INTEGER | 主键 |
| name | TEXT | 非空 |
| category_id | INTEGER | 外键 → categories.id |
| price | REAL | 非负，`CHECK (price >= 0)` |
| stock | INTEGER | 非负整数 |
| image_url | TEXT | 图片地址，默认空（空时前端用占位图） |
| description | TEXT | 描述 |
| specifications | TEXT | 规格参数 |
| status | TEXT | `on_sale` / `off_shelf`，默认在售 |
| created_at / updated_at | TEXT | 时间戳 |

索引：`category_id`、`status`。

### orders 订单
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键 |
| order_no | TEXT | 唯一，格式 `PH + 日期 + 随机hex` |
| user_id | INTEGER | 外键 → users.id |
| total_amount | REAL | 非负，由后端按数据库价格计算 |
| status | TEXT | `pending/paid/shipped/completed/cancelled` |
| recipient / phone / address | TEXT | 收货信息 |
| created_at | TEXT | 下单时间 |

索引：`user_id`。

### order_items 订单明细
| 字段 | 类型 | 说明 |
|---|---|---|
| id | INTEGER | 主键 |
| order_id | INTEGER | 外键 → orders.id |
| product_id | INTEGER | 外键 → products.id |
| product_name | TEXT | 下单时名称快照 |
| unit_price | REAL | 下单时单价快照 |
| quantity | INTEGER | `CHECK (quantity > 0)` |
| subtotal | REAL | 行小计快照 |

索引：`order_id`。

## 关键设计

1. **参数化查询**：全部使用 prepared statement 命名/位置占位，杜绝 SQL 注入。
2. **订单快照**：明细保存当时名称与单价，商品后续改价不影响历史订单。
3. **事务**：下单使用 `BEGIN IMMEDIATE`，先校验全部库存，再写订单、明细、扣库存；任一环节失败 `ROLLBACK`，不会出现部分扣减。
4. **软删除**：商品下架置 `off_shelf`，不物理删除，保证历史订单可追溯。
5. **金额精度**：写入与返回时统一四舍五入到分（`Math.round(x*100)/100`）。
6. **外键**：`PRAGMA foreign_keys = ON`，WAL 日志模式。
