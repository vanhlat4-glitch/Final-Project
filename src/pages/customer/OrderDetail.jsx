import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "../../constants/orderStatus";
import { PAYMENT_STATUS_LABEL } from "../../constants/paymentStatus";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: orders, loading, update } = useApi(RESOURCES.ORDERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const { items: reviews, create: createReview } = useApi(RESOURCES.REVIEWS);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const order = orders.find((o) => String(o.id) === String(id));
  const vehicle = order ? vehicles.find((v) => String(v.id) === String(order.vehicleId)) : null;
  const alreadyReviewed = reviews.some((r) => String(r.orderId) === String(id));

  if (loading) {
    return (
      <DashboardLayout title="Chi tiết đơn hàng">
        <Loading />
      </DashboardLayout>
    );
  }

  if (!order || !vehicle) {
    return (
      <DashboardLayout title="Không tìm thấy đơn hàng">
        <Link to="/customer/orders" className="link">← Quay lại danh sách đơn</Link>
      </DashboardLayout>
    );
  }

  async function handleCancel() {
    if (confirm("Huỷ đơn thuê xe này?")) await update(order.id, { status: "cancelled" });
  }

  async function submitReview() {
    setSaving(true);
    try {
      await createReview({
        customerId: user.id,
        vehicleId: order.vehicleId,
        orderId: order.id,
        rating,
        comment,
        providerReply: "",
      });
      setReviewOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title={`Đơn #${String(order.id).slice(-6)}`} subtitle={vehicle.name}>
      <Link to="/customer/orders" className="link text-sm">← Quay lại danh sách đơn</Link>

      <div className="detail-hero mt-16">
        <div className="card">
          <img src={vehicle.image} alt={vehicle.name} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8, marginBottom: 14 }} />
          <div style={{ fontWeight: 700, fontFamily: "var(--font-display)", fontSize: 16 }}>{vehicle.name}</div>
          <div className="text-muted text-sm mt-8">{vehicle.type} · {vehicle.seats} chỗ · {vehicle.location}</div>
        </div>

        <div className="card">
          <div className="flex-between mb-16">
            <h3 style={{ fontSize: 16 }}>Thông tin đơn hàng</h3>
            <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
          </div>

          <div className="text-sm" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="flex-between"><span className="text-muted">Ngày nhận xe</span><span>{formatDate(order.startDate)}</span></div>
            <div className="flex-between"><span className="text-muted">Ngày trả xe</span><span>{formatDate(order.endDate)}</span></div>
            <div className="flex-between"><span className="text-muted">Thanh toán</span><span>{PAYMENT_STATUS_LABEL[order.paymentStatus] || "—"}</span></div>
            {order.promoCode && <div className="flex-between"><span className="text-muted">Mã khuyến mãi</span><span className="mono">{order.promoCode}</span></div>}
          </div>

          <div className="lane-divider mt-16 mb-16" style={{ opacity: 0.4 }} />

          <div className="flex-between mb-16" style={{ fontWeight: 700, fontSize: 16 }}>
            <span>Tổng tiền</span>
            <span className="mono">{formatVND(order.totalPrice)}</span>
          </div>

          <div className="flex gap-8" style={{ flexWrap: "wrap" }}>
            {order.status === "pending" && (
              <button className="btn btn-danger" onClick={handleCancel}>Huỷ đơn</button>
            )}
            {(order.status === "confirmed" || order.status === "ongoing") && (
              <button className="btn btn-outline" onClick={() => navigate(`/customer/tracking/${order.id}`)}>Theo dõi tình trạng xe</button>
            )}
            {order.status === "completed" && !alreadyReviewed && (
              <button className="btn btn-signal" onClick={() => setReviewOpen(true)}>Viết đánh giá</button>
            )}
            {order.status === "completed" && alreadyReviewed && (
              <span className="badge badge-neutral">Bạn đã đánh giá đơn này</span>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={reviewOpen}
        title="Đánh giá chuyến đi"
        onClose={() => setReviewOpen(false)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setReviewOpen(false)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={submitReview}>{saving ? "Đang gửi..." : "Gửi đánh giá"}</button>
          </>
        }
      >
        <div className="field">
          <label>Số sao</label>
          <div className="stars" style={{ fontSize: 22, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} onClick={() => setRating(n)}>{n <= rating ? "★" : "☆"}</span>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Nhận xét</label>
          <textarea className="input" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Chia sẻ trải nghiệm của bạn..." />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
