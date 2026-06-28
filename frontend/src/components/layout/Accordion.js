import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Accordion({ items, defaultOpen }) {
    const [openItem, setOpenItem] = useState(defaultOpen || null);
    const toggleItem = (id) => {
        setOpenItem(openItem === id ? null : id);
    };
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }, children: items.map((item) => (_jsxs("div", { style: {
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
            }, children: [_jsxs("button", { type: "button", onClick: () => toggleItem(item.id), style: {
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: openItem === item.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                        border: 'none',
                        borderBottom: openItem === item.id ? '1px solid #e2e8f0' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#0f172a',
                    }, children: [item.title, _jsx("span", { style: {
                                fontSize: '1.2rem',
                                color: '#64748b',
                                transition: 'transform 0.2s ease',
                                transform: openItem === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            }, children: "\u25BC" })] }), openItem === item.id && (_jsx("div", { style: { padding: '1rem' }, children: item.content }))] }, item.id))) }));
}
