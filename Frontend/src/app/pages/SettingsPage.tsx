import React, { useState } from 'react';
import {
  Bell,
  Lock,
  CreditCard,
  Users,
  Shield,
  Trash2,
  Moon,
  Globe,
  ChevronRight,
} from 'lucide-react';

type SettingGroup = {
  label: string;
  items: {
    icon: React.ReactNode;
    title: string;
    description: string;
    badge?: string;
  }[];
};

const SETTING_GROUPS: SettingGroup[] = [
  {
    label: 'Account',
    items: [
      {
        icon: <Bell size={16} />,
        title: 'Notifications',
        description: 'Manage email and in-app notification preferences',
        badge: '3 new',
      },
      {
        icon: <Lock size={16} />,
        title: 'Password & Security',
        description: 'Update password, two-factor authentication',
      },
      {
        icon: <Globe size={16} />,
        title: 'Language & Region',
        description: 'Set your preferred language and timezone',
      },
    ],
  },
  {
    label: 'Preferences',
    items: [
      {
        icon: <Moon size={16} />,
        title: 'Appearance',
        description: 'Light or dark mode, font size preferences',
      },
      {
        icon: <Users size={16} />,
        title: 'Privacy',
        description: 'Control who can see your profile and activity',
      },
    ],
  },
  {
    label: 'Billing',
    items: [
      {
        icon: <CreditCard size={16} />,
        title: 'Payment Methods',
        description: 'Add or manage your payment options',
        badge: 'Coming soon',
      },
      {
        icon: <Shield size={16} />,
        title: 'Subscription',
        description: 'Manage your plan and usage limits',
        badge: 'Coming soon',
      },
    ],
  },
  {
    label: 'Danger Zone',
    items: [
      {
        icon: <Trash2 size={16} />,
        title: 'Delete Account',
        description: 'Permanently delete your account and all data',
      },
    ],
  },
];

export function SettingsPage() {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 style={{ color: '#3C3F20' }}>Settings</h1>
        <p className="text-sm opacity-55 mt-0.5" style={{ color: '#3C3F20' }}>
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        {SETTING_GROUPS.map((group) => (
          <div key={group.label}>
            <p
              className="text-xs uppercase tracking-widest opacity-40 mb-3 px-1"
              style={{ color: '#3C3F20' }}
            >
              {group.label}
            </p>
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: '#E8E3C8' }}
            >
              {group.items.map((item, idx) => {
                const isDanger = group.label === 'Danger Zone';
                return (
                  <button
                    key={item.title}
                    onClick={() =>
                      setActiveItem(activeItem === item.title ? null : item.title)
                    }
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all cursor-pointer hover:bg-black/5 ${
                      idx !== 0 ? 'border-t' : ''
                    }`}
                    style={{ borderColor: '#D0CBAF' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isDanger ? '#fee2e2' : '#FDF9EB',
                        color: isDanger ? '#ef4444' : '#3C3F20',
                      }}
                    >
                      {item.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm"
                        style={{ color: isDanger ? '#ef4444' : '#3C3F20' }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="text-xs opacity-50 mt-0.5"
                        style={{ color: '#3C3F20' }}
                      >
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.badge && (
                        <span
                          className="text-xs px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              item.badge === 'Coming soon' ? '#D0CBAF' : '#BFC897',
                            color: '#3C3F20',
                            opacity: item.badge === 'Coming soon' ? 0.7 : 1,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        size={15}
                        className={`transition-transform ${
                          activeItem === item.title ? 'rotate-90' : ''
                        }`}
                        style={{ color: '#3C3F20', opacity: 0.35 }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded placeholder panel */}
            {group.items.some((item) => activeItem === item.title) && (
              <div
                className="rounded-2xl p-6 mt-2 shadow-sm"
                style={{ backgroundColor: '#FDF9EB' }}
              >
                <p className="text-sm opacity-60 text-center" style={{ color: '#3C3F20' }}>
                  This settings panel is reserved for future implementation. Check back soon!
                </p>
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="px-5 py-2 rounded-xl text-sm text-white transition-all hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: '#3C3F20' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
