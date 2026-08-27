import Taskbar from "./Taskbar";
import Header from "./Header";

export default function DashboardLayout({ title, subtitle, children }) {
  return (
    <div className="app-shell">
      {/* Top Animated Taskbar Dock */}
      <Taskbar />
      <div className="main">
        <Header title={title} subtitle={subtitle} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
