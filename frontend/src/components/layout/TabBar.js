import { jsx as _jsx } from "react/jsx-runtime";
export function TabBar({ tabs, activeTab, onTabChange }) {
    return (_jsx("div", { className: "tab-bar", children: tabs.map((tab) => (_jsx("button", { type: "button", className: `tab-btn ${activeTab === tab.id ? 'active' : ''}`, onClick: () => onTabChange(tab.id), children: tab.label }, tab.id))) }));
}
