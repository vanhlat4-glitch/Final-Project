import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Header title={title} subtitle={subtitle} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
