import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import FormFields from "../../components/ui/FormFields";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const FIELDS = [
  { row: [
    { name: "name", label: "Tên xe", required: true, placeholder: "VD: Toyota Vios 2023" },
    { name: "brand", label: "Hãng xe", required: true, placeholder: "VD: Toyota" },
  ] },
  { row: [
    {
      name: "type",
      label: "Loại xe",
      type: "select",
      required: true,
      options: ["Sedan", "SUV", "Hatchback", "SUV điện", "MPV", "Bán tải"].map((v) => ({ value: v, label: v })),
    },
    { name: "seats", label: "Số chỗ ngồi", type: "number", required: true, placeholder: "5" },
  ] },
  { row: [
    {
      name: "transmission",
      label: "Hộp số",
      type: "select",
      required: true,
      options: [{ value: "Số tự động", label: "Số tự động" }, { value: "Số sàn", label: "Số sàn" }],
    },
    {
      name: "fuel",
      label: "Nhiên liệu",
      type: "select",
      required: true,
      options: ["Xăng", "Dầu diesel", "Điện", "Hybrid"].map((v) => ({ value: v, label: v })),
    },
  ] },
  { row: [
    { name: "pricePerDay", label: "Giá thuê / ngày (₫)", type: "number", required: true, placeholder: "700000" },
    { name: "location", label: "Khu vực", required: true, placeholder: "VD: Hà Nội" },
  ] },
  { name: "image", label: "Link ảnh xe", hint: "URL hình ảnh", placeholder: "https://..." },
  { name: "description", label: "Mô tả xe", type: "textarea", placeholder: "Tình trạng xe, tiện ích đi kèm..." },
];

const EMPTY = {
  name: "", brand: "", type: "", seats: 5, transmission: "", fuel: "",
  pricePerDay: "", location: "", image: "", description: "",
};

export default function PostCar() {
  const { user } = useAuth();
  const { create } = useApi(RESOURCES.VEHICLES);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await create({
        ...form,
        providerId: user.id,
        status: "pending",
        rating: 0,
        image: form.image || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600",
      });
      setDone(true);
      setForm(EMPTY);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Đăng tin cho thuê xe" subtitle="Điền thông tin xe để gửi lên Admin kiểm duyệt">
      <div className="card" style={{ maxWidth: 720 }}>
        {done && (
          <div className="form-success flex-between">
            <span>Đã gửi tin đăng! Xe của bạn đang chờ Admin kiểm duyệt.</span>
            <button className="btn btn-outline btn-sm" onClick={() => navigate("/provider/cars")}>Xem danh sách xe</button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormFields fields={FIELDS} values={form} onChange={setForm} />
          <button className="btn btn-signal" disabled={saving}>{saving ? "Đang đăng..." : "Đăng tin cho thuê"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
