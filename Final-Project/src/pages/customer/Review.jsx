import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

export default function Review() {
  const { user } = useAuth();
  const { items: reviews, loading } = useApi(RESOURCES.REVIEWS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);

  const myReviews = useMemo(() => reviews.filter((r) => String(r.customerId) === String(user.id)), [reviews, user.id]);
  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";
  const vehicleImage = (id) => vehicles.find((v) => String(v.id) === String(id))?.image;

  return (
    <DashboardLayout title="Đánh giá của tôi" subtitle="Các đánh giá bạn đã gửi cho những chuyến thuê xe đã hoàn tất">
      {loading ? (
        <Loading />
      ) : myReviews.length === 0 ? (
        <EmptyState title="Bạn chưa viết đánh giá nào" hint="Đánh giá sẽ khả dụng sau khi bạn hoàn tất một chuyến thuê xe." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myReviews.map((r) => (
            <div className="card flex" style={{ gap: 14 }} key={r.id}>
              <img src={vehicleImage(r.vehicleId)} alt="" style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <strong>{vehicleName(r.vehicleId)}</strong>
                  <span className="stars text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p className="text-sm mt-8">{r.comment}</p>
                <div className="text-muted text-sm mt-8">{formatDate(r.createdAt)}</div>
                {r.providerReply && (
                  <div className="mt-8" style={{ background: "var(--paper)", borderRadius: 8, padding: 10 }}>
                    <div className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>Phản hồi từ nhà cung cấp</div>
                    <p className="text-sm">{r.providerReply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
