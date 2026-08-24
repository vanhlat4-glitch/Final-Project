import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";

export default function VehicleDetail() {
  const { id } = useParams();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: reviews } = useApi(RESOURCES.REVIEWS);

  const vehicle = vehicles.find((v) => String(v.id) === String(id));
  const vehicleReviews = reviews.filter((r) => String(r.vehicleId) === String(id));

  if (loading) {
    return (
      <DashboardLayout title="Chi tiết xe">
        <Loading />
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout title="Không tìm thấy xe">
        <Link to="/customer/search" className="link">← Quay lại tìm xe</Link>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={vehicle.name} subtitle={`${vehicle.brand} · ${vehicle.location}`}>
      <Link to="/customer/search" className="link text-sm">← Quay lại tìm xe</Link>
      <div className="detail-hero mt-16">
        <div>
          <img src={vehicle.image} alt={vehicle.name} />
          <div className="kpi-row mt-16">
            <div><strong>{vehicle.seats}</strong><span className="text-muted text-sm">Số chỗ</span></div>
            <div><strong>{vehicle.transmission}</strong><span className="text-muted text-sm">Hộp số</span></div>
            <div><strong>{vehicle.fuel}</strong><span className="text-muted text-sm">Nhiên liệu</span></div>
            <div><strong>{vehicle.rating > 0 ? `★ ${vehicle.rating}` : "Chưa có"}</strong><span className="text-muted text-sm">Đánh giá</span></div>
          </div>
          <p className="text-sm mt-16">{vehicle.description}</p>

          {vehicleReviews.length > 0 && (
            <div className="mt-24">
              <h3 style={{ fontSize: 15, marginBottom: 10 }}>Đánh giá từ khách hàng</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {vehicleReviews.map((r) => (
                  <div className="card" key={r.id}>
                    <span className="stars text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <p className="text-sm mt-8">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Sẵn sàng lên đường?</h3>
          <div className="price mb-16" style={{ fontSize: 22 }}>
            {formatVND(vehicle.pricePerDay)}<small> /ngày</small>
          </div>
          <p className="text-sm text-muted mb-16">Chọn ngày nhận và trả xe ở bước tiếp theo, có thể áp mã khuyến mãi.</p>
          <Link to={`/customer/booking/${vehicle.id}`} className="btn btn-signal btn-block">Đặt xe này</Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
