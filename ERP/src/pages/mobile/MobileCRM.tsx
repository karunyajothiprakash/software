import React, { useState } from 'react';
import { User, Phone, Briefcase, MessageCircle, Search, ChevronRight } from 'lucide-react';

const leads = [
  { id: 1, name: 'Rajesh Kumar', company: 'Chennai Traders', status: 'New', phone: '+91 98765 43210', lastContact: '2026-05-29' },
  { id: 2, name: 'Priya M', company: 'Coimbatore Textiles', status: 'Contacted', phone: '+91 91234 56789', lastContact: '2026-05-28' },
  { id: 3, name: 'Vikram R', company: 'Madurai Exports', status: 'Qualified', phone: '+91 99887 66554', lastContact: '2026-05-27' },
];

const activities = [
  { id: 1, type: 'Call', user: 'You', target: 'Rajesh Kumar', time: 'Today, 10:30 AM' },
  { id: 2, type: 'Message', user: 'You', target: 'Priya M', time: 'Yesterday, 4:15 PM' },
  { id: 3, type: 'Meeting', user: 'You', target: 'Vikram R', time: '2 days ago, 2:00 PM' },
];

const MobileCRM: React.FC = () => {
  const [search, setSearch] = useState('');
  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-yellow-400 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-yellow-400" /> Mobile CRM
        </h1>
        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg px-2 py-1">
          <Search className="w-4 h-4 text-yellow-400" />
          <input
            className="bg-transparent outline-none text-yellow-200 placeholder-yellow-500 text-sm"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-neutral-900 rounded-lg p-3 flex flex-col items-center">
          <User className="w-6 h-6 text-yellow-400 mb-1" />
          <div className="text-lg font-bold">3</div>
          <div className="text-yellow-300 text-xs">Leads</div>
        </div>
        <div className="bg-neutral-900 rounded-lg p-3 flex flex-col items-center">
          <Phone className="w-6 h-6 text-yellow-400 mb-1" />
          <div className="text-lg font-bold">2</div>
          <div className="text-yellow-300 text-xs">Calls</div>
        </div>
        <div className="bg-neutral-900 rounded-lg p-3 flex flex-col items-center">
          <MessageCircle className="w-6 h-6 text-yellow-400 mb-1" />
          <div className="text-lg font-bold">1</div>
          <div className="text-yellow-300 text-xs">Messages</div>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-neutral-900 rounded-xl p-3 mb-2">
        <div className="font-semibold text-yellow-300 mb-2">Leads</div>
        <ul className="divide-y divide-neutral-800">
          {filteredLeads.map(lead => (
            <li key={lead.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-bold text-yellow-200 text-base">{lead.name}</div>
                <div className="text-yellow-500 text-xs">{lead.company}</div>
                <div className="text-yellow-600 text-xs">{lead.phone}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-xs font-semibold ${lead.status === 'New' ? 'text-yellow-400' : lead.status === 'Contacted' ? 'text-blue-400' : 'text-green-400'}`}>{lead.status}</span>
                <button className="mt-1 text-yellow-400 hover:text-yellow-200 flex items-center gap-1 text-xs">
                  Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
          {filteredLeads.length === 0 && (
            <li className="py-4 text-center text-yellow-500">No leads found.</li>
          )}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-neutral-900 rounded-xl p-3">
        <div className="font-semibold text-yellow-300 mb-2">Recent Activity</div>
        <ul className="divide-y divide-neutral-800">
          {activities.map(act => (
            <li key={act.id} className="py-2 flex items-center gap-2">
              <span className="text-yellow-400 font-bold text-xs">{act.type}</span>
              <span className="text-yellow-200 text-xs">{act.user} → {act.target}</span>
              <span className="ml-auto text-yellow-500 text-xs">{act.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MobileCRM;
