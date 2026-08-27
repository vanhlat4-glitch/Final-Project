import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../hooks/useLanguage";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

export default function CustomerPromotions() {
  const { items: promotions, loading } = useApi(RESOURCES.PROMOTIONS);
  const { items: providers } = useApi(RESOURCES.PROVIDERS);
  const { t, isEn } = useLanguage();

  const providerName = (id) => providers.find((p) => String(p.id) === String(id))?.name || "Morent";

  if (loading) {
    return (
      <DashboardLayout title={t("Ưu đãi", "Special Offers")}>
        <Loading />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t("Ưu đãi & khuyến mãi", "Deals & Promotions")}
      subtitle={t("Áp dụng mã khi đặt xe để được giảm giá", "Apply discount codes during checkout to get discounts")}
    >
      {promotions.length === 0 ? (
        <EmptyState
          title={isEn ? "No active promotions yet" : "Chưa có ưu đãi nào"}
          hint={isEn ? "Please check back later, providers frequently update special offers." : "Quay lại sau nhé, các nhà cung cấp thường xuyên cập nhật khuyến mãi mới."}
        />
      ) : (
        <div className="grid grid-3">
          {promotions.map((p) => (
            <div className="card" key={p.id}>
              <div className="flex-between mb-8">
                <span className="badge badge-warning">-{p.discountPercent}%</span>
                <span className="text-sm text-muted">
                  {isEn ? "Expires" : "HSD"} {formatDate(p.expiryDate)}
                </span>
              </div>
              <div className="mono" style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: "var(--signal-dark)" }}>
                {p.code}
              </div>
              <p className="text-sm text-muted mb-8">{p.description}</p>
              <div className="text-sm">
                <span className="text-muted">{isEn ? "Applicable for:" : "Áp dụng:"}</span> <strong>{providerName(p.providerId)}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
