import { useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

const FIELDS = [
  { row: [
    { name: "code", label: "Mã khuyến mãi", required: true, placeholder: "VD: MORENT10" },
    { name: "discountPercent", label: "% Giảm giá", type: "number", required: true, placeholder: "10" },
  ] },
  { name: "description", label: "Mô tả chương trình", type: "textarea" },
  { name: "expiryDate", label: "Ngày hết hạn", type: "date", required: true },
];

const EMPTY = { code: "", discountPercent: "", description: "", expiryDate: "" };

export default function ProviderPromotions() {
  const { user } = useAuth();
  const { items, loading, create, remove } = useApi(RESOURCES.PROMOTIONS);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const myPromotions = useMemo(() => items.filter((p) => String(p.providerId) === String(user.id)), [items, user.id]);

  async function handleSave() {
    setSaving(true);
    try {
      await create({ ...modal.data, providerId: user.id });
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (confirm(`Gỡ mã "${row.code}"?`)) await remove(row.id);
  }

  return (
    <DashboardLayout title="Khuyến mãi" subtitle="Tạo, chỉnh sửa và xoá các chương trình khuyến mãi của bạn">
      <div className="section-head">
        <div>
          <h2>Chương trình đang chạy</h2>
          <p>{myPromotions.length} mã khuyến mãi</p>
        </div>
        <button className="btn btn-signal" onClick={() => setModal({ data: EMPTY })}>+ Tạo khuyến mãi</button>
      </div>

      <Table
        loading={loading}
        rows={myPromotions}
        emptyTitle="Chưa có chương trình khuyến mãi"
        columns={[
          { key: "code", label: "Mã", render: (r) => <span className="mono">{r.code}</span> },
          { key: "discountPercent", label: "Giảm giá", render: (r) => <Badge tone="warning">-{r.discountPercent}%</Badge> },
          { key: "description", label: "Mô tả" },
          { key: "expiryDate", label: "Hết hạn", render: (r) => formatDate(r.expiryDate) },
        ]}
        renderActions={(row) => (
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Gỡ bỏ</button>
        )}
      />

      <Modal
        open={!!modal}
        title="Tạo khuyến mãi mới"
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu..." : "Tạo"}</button>
          </>
        }
      >
        {modal && <FormFields fields={FIELDS} values={modal.data} onChange={(data) => setModal({ data })} />}
      </Modal>
    </DashboardLayout>
  );
}
