// Idempotent seed: only populates when categories table is empty.
import db from './index.js'

export function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS n FROM categories').get()
  if (row.n > 0) return false

  const insertCat = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)')
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category_id, price, stock, image_url, description, specifications, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'on_sale')
  `)

  const categories = [
    { name: '3D 打印机', description: 'FDM / 光固化桌面级与工业级打印机' },
    { name: '3D 打印耗材', description: 'PLA / ABS / PETG / TPU 等线材与树脂' },
    { name: '打印配件', description: '喷嘴、热床、AMS、工具与备件' },
    { name: '3D 扫描设备', description: '手持与桌面式三维扫描仪' }
  ]

  const catIds = {}
  for (const c of categories) {
    const info = insertCat.run(c.name, c.description)
    catIds[c.name] = Number(info.lastInsertRowid)
  }

  const products = [
    // 3D 打印机
    { name: 'Bambu Lab P1P 组装型 3D 打印机', cat: '3D 打印机', price: 2499.0, stock: 12, img: '/images/products/bambu-p1p.jpg', desc: 'CoreXY 结构，最高 500mm/s 打印速度，自动调平，支持多色扩展。', spec: '成型体积 256×256×256mm；喷嘴温度 300℃；支持 PLA/PETG/ABS/TPU' },
    { name: 'Prusa MK4 免调平 3D 打印机', cat: '3D 打印机', price: 3299.0, stock: 5, img: '/images/products/prusa-mk4.jpg', desc: '工业级免调平热床，网线远程管理，开源固件。', spec: '成型体积 250×210×220mm；E3D 硬化钢喷嘴；网络联机打印' },
    { name: 'Anycubic Photon M3 光固化打印机', cat: '3D 打印机', price: 1899.0, stock: 8, img: '/images/products/anycubic-photon.jpg', desc: '7.6 英寸 4K 黑白屏，高精度光敏树脂打印，适合手办与珠宝。', spec: '成型体积 170×98×218mm；LCD 4K；波长 405nm' },
    // 耗材
    { name: 'PLA+ 高亮耗材 1kg 橙色', cat: '3D 打印耗材', price: 69.0, stock: 48, img: '/images/products/pla-orange.jpg', desc: '高韧性 PLA+，低气味，不翘边，适合日常展示件。', spec: '直径 1.75mm；净重 1kg；推荐喷嘴 200-220℃' },
    { name: 'ABS 工程级耗材 1kg 黑色', cat: '3D 打印耗材', price: 89.0, stock: 60, img: '/images/products/abs-black.jpg', desc: '耐热耐冲击，适合功能件与外壳，需封闭箱体使用。', spec: '直径 1.75mm；净重 1kg；推荐喷嘴 240-260℃' },
    { name: 'PETG 耐水耗材 1kg 透明', cat: '3D 打印耗材', price: 79.0, stock: 35, img: '/images/products/petg-clear.jpg', desc: '耐化学腐蚀、低吸湿，适合容器与户外件。', spec: '直径 1.75mm；净重 1kg；推荐喷嘴 230-250℃' },
    { name: '水洗光敏树脂 1kg 灰色', cat: '3D 打印耗材', price: 129.0, stock: 20, img: '/images/products/resin-gray.jpg', desc: '低气味水洗树脂，无需酒精清洗，适合桌面光固化。', spec: '405nm；硬度 Shore D80；固化时间 2-3s' },
    // 配件
    { name: '硬化钢喷嘴 0.4mm 三件套', cat: '打印配件', price: 45.0, stock: 30, img: '/images/products/nozzle-set.jpg', desc: '耐磨硬化钢，可打印碳纤维与研磨性耗材。', spec: 'M6×1mm；喷嘴孔径 0.4mm；三件套装' },
    { name: 'Bambu AMS 多色供料系统', cat: '打印配件', price: 1299.0, stock: 3, img: '/images/products/bambu-ams.jpg', desc: '四通道自动换色，配合 P1P/X1 实现多色打印。', spec: '兼容 Bambu Lab P1P/X1 系列；支持 4 色同时供料' },
    { name: 'PEI 双面弹性热床贴膜', cat: '打印配件', price: 89.0, stock: 25, img: '/images/products/pei-sheet.jpg', desc: '双面 PEI 弹簧钢板，取件轻松，附着力强。', spec: '尺寸 256×256mm；双面可用；适配 P1P' },
    // 扫描仪
    { name: 'Revopoint MINI 2 手持 3D 扫描仪', cat: '3D 扫描设备', price: 3999.0, stock: 2, img: '/images/products/revopoint-mini.jpg', desc: '0.02mm 精度，彩色扫描，支持人像与小物件。', spec: '精度 0.02mm；扫描速率 10fps；支持 iOS/Windows' },
    { name: 'Shining EinScan-SE 桌面扫描仪', cat: '3D 扫描设备', price: 6999.0, stock: 1, img: '/images/products/einscan-se.jpg', desc: '转盘式高精度扫描，适合工业小件逆向建模。', spec: '精度 0.05mm；单幅 200×150mm；配自动转盘' }
  ]

  for (const p of products) {
    insertProduct.run(p.name, catIds[p.cat], p.price, p.stock, p.img, p.desc, p.spec)
  }

  return true
}

// Allow running `node src/database/seed.js` to manually (re)seed an empty DB.
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const did = seedIfEmpty()
  console.log(did ? '[seed] demo data inserted' : '[seed] already populated, skipped')
}
