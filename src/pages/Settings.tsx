import { useState } from 'react';
import { Save, User, Bell, Shield, Database, Globe } from 'lucide-react';

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">{icon}</div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 items-center gap-4 py-3 border-b border-gray-50 last:border-0">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const selectCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState({ name: 'Admin', email: 'admin@pgmsystem.com', phone: '9876543210', org: 'Property & Garage Mgmt.' });
  const [notifications, setNotifications] = useState({ email: true, sms: false, dueReminder: true, backupAlert: true });
  const [system, setSystem] = useState({ currency: 'INR (₹)', language: 'English', timezone: 'Asia/Kolkata (IST)', dateFormat: 'DD-MM-YYYY' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your system preferences</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Profile */}
        <Section title="Profile Settings" icon={<User size={17} />}>
          <div className="space-y-0">
            <Field label="Full Name">
              <input className={inputCls} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </Field>
            <Field label="Email Address">
              <input className={inputCls} type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Phone Number">
              <input className={inputCls} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </Field>
            <Field label="Organization">
              <input className={inputCls} value={profile.org} onChange={e => setProfile(p => ({ ...p, org: e.target.value }))} />
            </Field>
          </div>
        </Section>

        {/* Notifications - Disabled for now */}
        <Section title="Notification Settings" icon={<Bell size={17} />}>
  <div
    className="space-y-0 pointer-events-none opacity-20 select-none"
    aria-disabled="true"
  >
    {[
      { label: 'Email Notifications', key: 'email' as const },
      { label: 'SMS Notifications', key: 'sms' as const },
      { label: 'Due Date Reminders', key: 'dueReminder' as const },
      { label: 'Backup Alerts', key: 'backupAlert' as const },
    ].map(f => (
      <Field key={f.key} label={f.label}>
        <Toggle
          checked={notifications[f.key]}
          onChange={v =>
            setNotifications(p => ({
              ...p,
              [f.key]: v,
            }))
          }
        />
      </Field>
    ))}
  </div>
</Section>

        {/* System */}
        <Section title="System Settings" icon={<Globe size={17} />}>
          <div className="space-y-0">
            <Field label="Currency">
              <select className={selectCls} value={system.currency} onChange={e => setSystem(p => ({ ...p, currency: e.target.value }))}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </Field>
            <Field label="Language">
              <select className={selectCls} value={system.language} onChange={e => setSystem(p => ({ ...p, language: e.target.value }))}>
                <option>English</option>
                <option>Hindi</option>
                <option>Bengali</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select className={selectCls} value={system.timezone} onChange={e => setSystem(p => ({ ...p, timezone: e.target.value }))}>
                <option>Asia/Kolkata (IST)</option>
                <option>UTC</option>
                <option>America/New_York (EST)</option>
              </select>
            </Field>
            <Field label="Date Format">
              <select className={selectCls} value={system.dateFormat} onChange={e => setSystem(p => ({ ...p, dateFormat: e.target.value }))}>
                <option>DD-MM-YYYY</option>
                <option>MM-DD-YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" icon={<Shield size={17} />}>
          <div className="space-y-0">
            <Field label="Current Password">
              <input className={inputCls} type="password" placeholder="••••••••" />
            </Field>
            <Field label="New Password">
              <input className={inputCls} type="password" placeholder="••••••••" />
            </Field>
            <Field label="Confirm Password">
              <input className={inputCls} type="password" placeholder="••••••••" />
            </Field>
            <div className="pt-3">
              <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </Section>
      </div>

      {/* App Info */}
      {/* <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Database size={17} /></div>
          <h2 className="text-base font-semibold text-gray-800">Application Information</h2>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Application Name', value: 'Property & Garage Management System' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Database', value: 'SQLite (Local)' },
            { label: 'Built With', value: 'React + Tauri' },
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
