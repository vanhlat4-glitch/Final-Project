import { useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

export default function ProviderReviews() {
  const { user } = useAuth();
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const { items: reviews, loading, update } = useApi(RESOURCES.REVIEWS);
  const { items: customers } = useApi(RESOURCES.CUSTOMERS);
  const [replyDrafts, setReplyDrafts] = useState({});

  const myVehicleIds = useMemo(() => vehicles.filter((v) => String(v.providerId) === String(user.id)).map((v) => v.id), [vehicles, user.id]);
  const myReviews = useMemo(() => reviews.filter((r) => myVehicleIds.includes(r.vehicleId)), [reviews, myVehicleIds]);

  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";
  const customerName = (id) => customers.find((c) => String(c.id) === String(id))?.name || "Khách hàng";

  async function sendReply(review) {
    const text = replyDrafts[review.id];
    if (!text) return;
    await update(review.id, { providerReply: text });
  }

  return (
    <DashboardLayout title="Đánh giá" subtitle="Xem và phản hồi đánh giá từ khách hàng về xe của bạn">
      {loading ? (
        <Loading />
      ) : myReviews.length === 0 ? (
        <EmptyState title="Chưa có đánh giá nào" hint="Đánh giá từ khách hàng sẽ hiện ở đây sau khi họ thuê xe." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myReviews.map((r) => (
            <div className="card" key={r.id}>
              <div className="flex-between mb-8">
                <div>
                  <strong>{vehicleName(r.vehicleId)}</strong>
                  <span className="text-muted text-sm"> · {customerName(r.customerId)} · {formatDate(r.createdAt)}</span>
                </div>
                <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
              </div>
              <p className="text-sm mb-16">{r.comment}</p>

              {r.providerReply ? (
                <div style={{ background: "var(--paper)", borderRadius: 8, padding: 12 }}>
                  <div className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>Phản hồi của bạn</div>
                  <p className="text-sm">{r.providerReply}</p>
                </div>
              ) : (
                <div className="flex gap-8">
                  <input
                    className="input"
                    placeholder="Viết phản hồi cho khách hàng..."
                    value={replyDrafts[r.id] || ""}
                    onChange={(e) => setReplyDrafts({ ...replyDrafts, [r.id]: e.target.value })}
                  />
                  <button className="btn btn-outline btn-sm" onClick={() => sendReply(r)}>Gửi</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
