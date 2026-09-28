'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Mail, Phone, Building2, Calendar, FileText } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  message: string | null;
  created_at: string;
}

export default function AdLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leads/admin')
      .then((res) => {
        setLeads(res.data);
      })
      .catch((err) => {
        console.error('Failed to load leads', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading leads...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ad Leads</h1>
        <p className="text-gray-500">Manage inquiries submitted from the public blog CTA.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No leads yet</h3>
            <p className="text-gray-500">When users submit the ad form on the blog, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900">{lead.name}</span>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Mail className="w-3.5 h-3.5" />
                          <a href={`mailto:${lead.email}`} className="hover:text-black">{lead.email}</a>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <a href={`tel:${lead.phone}`} className="hover:text-black">{lead.phone}</a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.company ? (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">None provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {lead.message ? (
                          <p className="text-sm text-gray-700 line-clamp-3" title={lead.message}>
                            {lead.message}
                          </p>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No message</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
