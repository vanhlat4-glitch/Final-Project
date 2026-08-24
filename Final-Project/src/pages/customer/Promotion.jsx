import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

export default function CustomerPromotions() {
  const { items: promotions, loading } = useApi(RESOURCES.PROMOTIONS);
  const { items: providers } = useApi(RESOURCES.PROVIDERS);

  const providerName = (id) => providers.find((p) => String(p.id) === String(id))?.name || "Morent";

  if (loading) {
    return (
      <DashboardLayout title="Ưu đãi">
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Ưu đãi & khuyến mãi" subtitle="Áp dụng mã khi đặt xe để được giảm giá">
      {promotions.length === 0 ? (
        <EmptyState title="Chưa có ưu đãi nào" hint="Quay lại sau nhé, các nhà cung cấp thường xuyên cập nhật khuyến mãi mới." />
      ) : (
        <div className="grid grid-3">
          {promotions.map((p) => (
            <div className="card" key={p.id}>
              <div className="flex-between mb-8">
                <span className="badge badge-warning">-{p.discountPercent}%</span>
                <span className="text-sm text-muted">HSD {formatDate(p.expiryDate)}</span>
              </div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{p.code}</div>
              <p className="text-sm text-muted mb-8">{p.description}</p>
              <div className="text-sm">Áp dụng: {providerName(p.providerId)}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
