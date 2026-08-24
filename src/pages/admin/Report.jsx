import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";

export default function Reports() {
  const { items: orders, loading: l1 } = useApi(RESOURCES.ORDERS);
  const { items: providers, loading: l2 } = useApi(RESOURCES.PROVIDERS);
  const { items: vehicles, loading: l3 } = useApi(RESOURCES.VEHICLES);
  const loading = l1 || l2 || l3;

  const paidOrders = useMemo(() => orders.filter((o) => o.paymentStatus === "paid"), [orders]);
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;

  const byProvider = useMemo(() => {
    return providers
      .map((p) => {
        const providerVehicleIds = vehicles.filter((v) => String(v.providerId) === String(p.id)).map((v) => v.id);
        const providerOrders = paidOrders.filter((o) => providerVehicleIds.includes(o.vehicleId));
        const revenue = providerOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
        return { id: p.id, name: p.name, orders: providerOrders.length, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [providers, vehicles, paidOrders]);

  const maxRevenue = Math.max(1, ...byProvider.map((p) => p.revenue));

  return (
    <DashboardLayout title="Báo cáo tài chính" subtitle="Theo dõi và quản lý tài chính của toàn bộ hệ thống">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-3 mb-16">
            <StatCard label="Tổng doanh thu" value={formatVND(totalRevenue)} hint={`từ ${paidOrders.length} đơn đã thanh toán`} />
            <StatCard label="Tổng đơn hàng" value={totalOrders} hint="trên toàn hệ thống" />
            <StatCard label="Giá trị TB / đơn" value={formatVND(avgOrderValue)} hint="đơn đã thanh toán" />
          </div>

          <div className="card">
            <div className="section-head">
              <div>
                <h2>Doanh thu theo nhà cung cấp</h2>
                <p>Xếp hạng theo doanh thu đã ghi nhận</p>
              </div>
            </div>
            {byProvider.length === 0 ? (
              <p className="text-muted text-sm">Chưa có dữ liệu doanh thu.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {byProvider.map((p) => (
                  <div key={p.id}>
                    <div className="flex-between text-sm mb-8">
                      <strong>{p.name}</strong>
                      <span className="mono">{formatVND(p.revenue)} · {p.orders} đơn</span>
                    </div>
                    <div style={{ height: 8, background: "var(--paper)", borderRadius: 6, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(4, (p.revenue / maxRevenue) * 100)}%`,
                          background: "var(--signal)",
                          borderRadius: 6,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
