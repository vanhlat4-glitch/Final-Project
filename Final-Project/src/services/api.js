import axios from "axios";
import {
  seedProviders,
  seedCustomers,
  seedVehicles,
  seedOrders,
  seedPromotions,
  seedReviews,
  seedNotifications,
  seedSupportTickets,
  seedStaff,
} from "./seedData";

/**
 * ============================================================================
 *  KẾT NỐI API - MindX Mockup Server
 * ============================================================================
 *  Base URL   : https://mindx-mockup-server.vercel.app
 *  API key    : 6a8304e926e7101a09135205
 *
 *  Cấu trúc endpoint (theo trang /instruction của server):
 *      GET    /api/resources?apiKey=KEY                          → danh sách resource
 *      POST   /api/resources?apiKey=KEY         body:{name}      → tạo resource mới
 *      GET    /api/resources/RESOURCE_NAME?apiKey=KEY             → lấy data
 *      POST   /api/resources/RESOURCE_NAME?apiKey=KEY   body:{}  → thêm data
 *      PUT    /api/resources/RESOURCE_NAME/_id?apiKey=KEY body:{} → cập nhật data
 *      DELETE /api/resources/RESOURCE_NAME/_id?apiKey=KEY         → xóa data
 *
 *  App luôn thử gọi API thật trước; nếu lỗi sẽ tự chuyển sang localStorage
 *  để KHÔNG BAO GIỜ đứng hình khi demo.
 * ============================================================================
 */

const BASE_URL = "https://mindx-mockup-server.vercel.app";
const API_KEY = "6a8c509d7b2bff61fd953a21";

// Tên resource tương ứng với từng bảng dữ liệu trong hệ thống
export const RESOURCES = {
  PROVIDERS: "providers",
  CUSTOMERS: "customers",
  VEHICLES: "vehicles",
  ORDERS: "orders",
  PROMOTIONS: "promotions",
  REVIEWS: "reviews",
  NOTIFICATIONS: "notifications",
  SUPPORT_TICKETS: "supportTickets",
  STAFF: "staff",
};

/**
 * Tạo URL đúng cấu trúc MindX Mockup Server
 * - Danh sách / tạo mới data: /api/resources/{resourceName}?apiKey=...
 * - Cập nhật / xóa data:      /api/resources/{resourceName}/{_id}?apiKey=...
 */
function buildUrl(resource, id) {
  const base = `${BASE_URL}/api/resources/${resource}`;
  const url = id ? `${base}/${id}` : base;
  return `${url}?apiKey=${API_KEY}`;
}

const client = axios.create({ timeout: 8000 });

// ---------------------------------------------------------------------------
// LỚP LƯU TRỮ DỰ PHÒNG (localStorage) - tự seed dữ liệu mẫu lần đầu chạy
// ---------------------------------------------------------------------------
const SEED = {
  [RESOURCES.PROVIDERS]: seedProviders,
  [RESOURCES.CUSTOMERS]: seedCustomers,
  [RESOURCES.VEHICLES]: seedVehicles,
  [RESOURCES.ORDERS]: seedOrders,
  [RESOURCES.PROMOTIONS]: seedPromotions,
  [RESOURCES.REVIEWS]: seedReviews,
  [RESOURCES.NOTIFICATIONS]: seedNotifications,
  [RESOURCES.SUPPORT_TICKETS]: seedSupportTickets,
  [RESOURCES.STAFF]: seedStaff,
};

function localKey(resource) {
  return `morent_${resource}`;
}

function readLocal(resource) {
  const raw = localStorage.getItem(localKey(resource));
  if (raw) return JSON.parse(raw);
  const seeded = SEED[resource] || [];
  localStorage.setItem(localKey(resource), JSON.stringify(seeded));
  return seeded;
}

function writeLocal(resource, data) {
  localStorage.setItem(localKey(resource), JSON.stringify(data));
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const localAdapter = {
  async list(resource) {
    return readLocal(resource);
  },
  async create(resource, payload) {
    const items = readLocal(resource);
    const item = { id: genId(), createdAt: new Date().toISOString().slice(0, 10), ...payload };
    items.unshift(item);
    writeLocal(resource, items);
    return item;
  },
  async update(resource, id, payload) {
    const items = readLocal(resource);
    const idx = items.findIndex((i) => String(i.id) === String(id) || String(i._id) === String(id));
    if (idx === -1) throw new Error("Không tìm thấy bản ghi");
    items[idx] = { ...items[idx], ...payload };
    writeLocal(resource, items);
    return items[idx];
  },
  async remove(resource, id) {
    const items = readLocal(resource);
    const next = items.filter((i) => String(i.id) !== String(id) && String(i._id) !== String(id));
    writeLocal(resource, next);
    return true;
  },
};

// ---------------------------------------------------------------------------
// LỚP GỌI API THẬT (kèm cờ báo để UI hiển thị trạng thái kết nối)
// ---------------------------------------------------------------------------
export const connectionState = { mode: "checking" }; // "live" | "offline" | "checking"

/**
 * Đảm bảo resource tồn tại trên server (tạo mới nếu chưa có).
 * Cache lại danh sách resource đã khởi tạo để không gọi lặp.
 */
const _initializedResources = new Set();

async function ensureResource(resource) {
  if (_initializedResources.has(resource)) return;
  try {
    // Kiểm tra resource đã tồn tại chưa
    const { data: existing } = await client.get(
      `${BASE_URL}/api/resources?apiKey=${API_KEY}`
    );
    const list = Array.isArray(existing)
      ? existing
      : Array.isArray(existing?.data?.resources)
      ? existing.data.resources
      : Array.isArray(existing?.data)
      ? existing.data
      : [];
    const found = list.some(
      (r) => r.name === resource || r.resourceName === resource
    );
    if (!found) {
      // Tạo resource mới trên server
      await client.post(`${BASE_URL}/api/resources?apiKey=${API_KEY}`, {
        name: resource,
      });
      console.log(`[API] Đã tạo resource "${resource}" trên server.`);
    }
    _initializedResources.add(resource);
  } catch (err) {
    console.warn(`[API] Không thể kiểm tra/tạo resource "${resource}":`, err.message);
  }
}

const remoteAdapter = {
  async list(resource) {
    await ensureResource(resource);
    const { data } = await client.get(buildUrl(resource));
    // Server có thể trả mảng trực tiếp, hoặc { data: [...] } hoặc { data: { data: [...] } }
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },
  async create(resource, payload) {
    await ensureResource(resource);
    const { data } = await client.post(buildUrl(resource), payload);
    return data?.data || data;
  },
  async update(resource, id, payload) {
    const { data } = await client.put(buildUrl(resource, id), payload);
    return data?.data || data;
  },
  async remove(resource, id) {
    await client.delete(buildUrl(resource, id));
    return true;
  },
};

async function withFallback(resource, action, args) {
  try {
    const result = await remoteAdapter[action](resource, ...args);
    connectionState.mode = "live";
    // đồng bộ cache local để các phần khác (nếu offline) vẫn nhất quán
    if (action === "list") writeLocal(resource, result);
    return result;
  } catch (err) {
    console.warn(`[API] ${action} ${resource} thất bại, chuyển sang offline:`, err.message);
    connectionState.mode = "offline";
    return localAdapter[action](resource, ...args);
  }
}

export const api = {
  list: (resource) => withFallback(resource, "list", []),
  create: (resource, payload) => withFallback(resource, "create", [payload]),
  update: (resource, id, payload) => withFallback(resource, "update", [id, payload]),
  remove: (resource, id) => withFallback(resource, "remove", [id]),
};

export default api;
