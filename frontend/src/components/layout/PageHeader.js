import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PageHeader({ title, subtitle, badge, children }) {
    return (_jsxs("header", { className: "page-header", children: [_jsxs("div", { className: "page-header-text", children: [badge && _jsx("span", { className: "page-badge", children: badge }), _jsx("h2", { children: title }), subtitle && _jsx("p", { className: "page-subtitle", children: subtitle })] }), children && _jsx("div", { className: "page-header-actions", children: children })] }));
}
