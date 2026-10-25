import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  Languages,
  Mic,
  PenTool,
  BookMarked,
  Award,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentTab, onSelectTab, isAdmin }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'grammar', label: 'Grammar & Polish', icon: CheckCircle2, category: 'AI Learning' },
    { id: 'vocab', label: 'Vocabulary Builder', icon: BookOpen, category: 'AI Learning' },
    { id: 'telugu', label: 'Telugu Translation Quiz', icon: Languages, category: 'Interactive Quizzes' },
    { id: 'daily', label: 'Idiom of the Day & Practice', icon: CalendarCheck, category: 'Interactive Quizzes' },
    { id: 'speaking', label: 'AI Speaking Studio', icon: Mic, category: 'Practice Modes', isFreeBadge: true },
    { id: 'writing', label: 'Writing Assistants', icon: PenTool, category: 'Practice Modes' },
    { id: 'reading', label: 'Reading Exercises', icon: BookMarked, category: 'Practice Modes' },
    { id: 'evaluation', label: 'Writing Evaluation', icon: Award, category: 'Assessment' },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin Settings', icon: ShieldCheck, category: 'System' });
  }

  const categories = ['Overview', 'AI Learning', 'Interactive Quizzes', 'Practice Modes', 'Assessment'];
  if (isAdmin) categories.push('System');

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '20px 14px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {categories.map((cat) => {
          const items = navItems.filter((item) => item.category === cat);
          if (items.length === 0) return null;

          return (
            <div key={cat}>
              <div style={{
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: 'var(--text-muted)',
                padding: '0 10px 8px 10px'
              }}>
                {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                        color: isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} />
                        <span>{item.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.isFreeBadge && (
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#059669',
                            textTransform: 'uppercase'
                          }}>
                            FREE
                          </span>
                        )}
                        {isActive && <ChevronRight size={14} color="var(--primary)" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
