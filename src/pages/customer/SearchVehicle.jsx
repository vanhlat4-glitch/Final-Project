import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";

export default function SearchVehicle() {
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("default");

  const approved = useMemo(() => vehicles.filter((v) => v.status === "approved"), [vehicles]);
  const types = useMemo(() => ["all", ...new Set(approved.map((v) => v.type))], [approved]);

  const results = useMemo(() => {
    let list = approved.filter((v) => {
      const matchesQ = `${v.name} ${v.brand} ${v.location}`.toLowerCase().includes(q.toLowerCase());
      const matchesType = type === "all" || v.type === type;
      return matchesQ && matchesType;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [approved, q, type, sort]);

  return (
    <DashboardLayout title="Tìm xe cho thuê" subtitle="Lọc theo loại xe, khu vực và mức giá phù hợp với bạn">
      <div className="filters-bar">
        <input className="input" placeholder="Tìm theo tên xe, hãng, khu vực..." value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          {types.map((t) => (
            <option key={t} value={t}>{t === "all" ? "Tất cả loại xe" : t}</option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">Sắp xếp: mặc định</option>
          <option value="price-asc">Giá: thấp → cao</option>
          <option value="price-desc">Giá: cao → thấp</option>
          <option value="rating">Đánh giá cao nhất</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : results.length === 0 ? (
        <EmptyState title="Không tìm thấy xe phù hợp" hint="Thử đổi từ khoá hoặc bộ lọc khác." />
      ) : (
        <div className="grid grid-3">
          {results.map((v) => (
            <Link to={`/customer/vehicles/${v.id}`} key={v.id} className="vehicle-card">
              <img className="vehicle-card__img" src={v.image} alt={v.name} />
              <div className="vehicle-card__body">
                <div className="vehicle-card__title">{v.name}</div>
                <div className="vehicle-card__meta">
                  <span>{v.type}</span>
                  <span>{v.seats} chỗ</span>
                  <span>{v.transmission}</span>
                  <span>{v.location}</span>
                </div>
                <div className="vehicle-card__foot">
                  <div className="price">{formatVND(v.pricePerDay)}<small> /ngày</small></div>
                  {v.rating > 0 && <span className="stars text-sm">★ {v.rating}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
