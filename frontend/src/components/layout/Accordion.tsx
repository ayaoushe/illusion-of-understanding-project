import { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
}

export function Accordion({ items, defaultOpen }: AccordionProps) {
  const [openItem, setOpenItem] = useState<string | null>(defaultOpen || null);

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            style={{
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
            }}
          >
            {item.title}
            <span style={{
              fontSize: '1.2rem',
              color: '#64748b',
              transition: 'transform 0.2s ease',
              transform: openItem === item.id ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
          {openItem === item.id && (
            <div style={{ padding: '1rem' }}>
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
