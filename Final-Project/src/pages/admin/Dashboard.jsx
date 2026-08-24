import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_LABEL } from "../../constants/orderStatus";

export default function AdminDashboard() {
  const { items: providers, loading: l1 } = useApi(RESOURCES.PROVIDERS);
  const { items: vehicles, loading: l2 } = useApi(RESOURCES.VEHICLES);
  const { items: orders, loading: l3 } = useApi(RESOURCES.ORDERS);
  const { items: customers, loading: l4 } = useApi(RESOURCES.CUSTOMERS);

  const loading = l1 || l2 || l3 || l4;

  const revenue = useMemo(
    () => orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
    [orders]
  );
  const pendingVehicles = vehicles.filter((v) => v.status === "pending").length;
  const recentOrders = [...orders].slice(0, 6);

  return (
    <DashboardLayout title="Tổng quan hệ thống" subtitle="Số liệu cập nhật theo thời gian thực từ tất cả nhà cung cấp">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-4 mb-16">
            <StatCard label="Nhà cung cấp" value={providers.length} hint="đơn vị đang hoạt động" />
            <StatCard label="Tổng số xe" value={vehicles.length} hint={`${pendingVehicles} xe chờ duyệt`} />
            <StatCard label="Khách hàng" value={customers.length} hint="tài khoản đã đăng ký" />
            <StatCard label="Doanh thu" value={formatVND(revenue)} hint="từ các đơn đã thanh toán" />
          </div>

          <div className="card">
            <div className="section-head">
              <div>
                <h2>Đơn hàng gần đây</h2>
                <p>6 đơn hàng mới nhất trên toàn hệ thống</p>
              </div>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-muted text-sm">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="table-wrap">
                <table className="dtable">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Thời gian thuê</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="mono">#{String(o.id).slice(-6)}</td>
                        <td>{formatDate(o.createdAt)}</td>
                        <td>
                          {formatDate(o.startDate)} → {formatDate(o.endDate)}
                        </td>
                        <td className="mono">{formatVND(o.totalPrice)}</td>
                        <td>
                          <Badge tone={o.status === "completed" ? "success" : o.status === "cancelled" ? "danger" : "warning"}>
                            {ORDER_STATUS_LABEL[o.status] || o.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
