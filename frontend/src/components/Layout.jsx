import { useState } from "react";
import {
    LayoutDashboard,
    Upload,
    History,
    FileText,
    ChevronLeft,
    ChevronRight,
    FlaskConical,
    Bell,
    Settings,
    User,
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
    { icon: Upload, label: "Upload", id: "upload" },
    { icon: History, label: "History", id: "history" },
    { icon: FileText, label: "Reports", id: "reports" },
];

export default function Layout({ children, activeNav, setActiveNav }) {
    const [collapsed, setCollapsed] = useState(false);

    const getPageTitle = () => {
        switch (activeNav) {
            case "dashboard":
                return { title: "Dashboard", subtitle: "Real-time equipment monitoring and analytics" };
            case "upload":
                return { title: "Upload Data", subtitle: "Import CSV files for comprehensive analysis" };
            case "history":
                return { title: "Historical Analysis", subtitle: "Track trends and performance over time" };
            case "reports":
                return { title: "Reports", subtitle: "Generate and export detailed reports" };
            default:
                return { title: "Dashboard", subtitle: "Real-time equipment monitoring and analytics" };
        }
    };

    const pageInfo = getPageTitle();

    return (
        <div className="flex min-h-screen" style={{ background: '#0a0a0f' }}>
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50 ${collapsed ? "w-20" : "w-72"
                    }`}
                style={{
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
                    borderRight: '1px solid rgba(148, 163, 184, 0.08)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-white"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        <FlaskConical className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <div className="animate-fade-in">
                            <h1 className="text-lg font-bold text-white tracking-tight">ChemViz</h1>
                            <p className="text-xs text-slate-500">Equipment Analytics</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="px-3 py-6 space-y-1">
                    <p className={`px-3 mb-3 text-xs font-medium text-slate-500 uppercase tracking-wider ${collapsed ? 'hidden' : ''}`}>
                        Menu
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveNav(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? "text-white"
                                        : "text-slate-400 hover:text-white"
                                    }`}
                                style={{
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)'
                                        : 'transparent',
                                    border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                                }}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-indigo-400" : "group-hover:text-indigo-400"}`} />
                                {!collapsed && (
                                    <span className="animate-fade-in font-medium">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    {/* Collapse button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                        style={{ background: 'rgba(148, 163, 184, 0.05)' }}
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main
                className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-72"
                    }`}
            >
                {/* Top navbar */}
                <header
                    className="sticky top-0 z-40 px-8 py-4"
                    style={{
                        background: 'rgba(10, 10, 15, 0.8)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">{pageInfo.title}</h2>
                            <p className="text-sm text-slate-500">{pageInfo.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Status indicator */}
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                                style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)'
                                }}
                            >
                                <span className="status-dot status-dot-success"></span>
                                <span className="text-sm font-medium text-emerald-400">System Online</span>
                            </div>

                            {/* Notification */}
                            <button
                                className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                                style={{ background: 'rgba(148, 163, 184, 0.05)' }}
                            >
                                <Bell className="w-5 h-5" />
                            </button>

                            {/* Settings */}
                            <button
                                className="p-2.5 rounded-xl text-slate-400 hover:text-white transition-colors"
                                style={{ background: 'rgba(148, 163, 184, 0.05)' }}
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {/* User avatar */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-medium"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                }}
                            >
                                <User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
