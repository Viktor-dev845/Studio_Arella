'use client';

import { useState } from 'react';
import PublicBlogLayout from '@/components/layout/PublicBlogLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';

export default function BookAdPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/leads', formData);
      setSuccess(true);
      toast.success('Request submitted successfully. We will contact you soon!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicBlogLayout>
      <PageTransition>
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center pt-20 pb-32 px-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2" />
              <h1 className="text-3xl font-bold text-white mb-3 relative z-10" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                Advertise With Us
              </h1>
              <p className="text-gray-300 relative z-10">
                Book a slot on Umuahia's premier digital screen. Fill out the form below and our team will get back to you immediately.
              </p>
            </div>
            
            <div className="p-10">
              {success ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
                  <p className="text-gray-600 mb-8">Thank you for your interest. An account manager will contact you at {formData.phone} shortly.</p>
                  <button onClick={() => window.location.href = '/blog'} className="bg-black text-white px-8 py-3 rounded font-bold hover:bg-gray-800 transition-colors">
                    Return to Blog
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Full Name *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="p-3 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Phone Number *</label>
                      <input 
                        required
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="p-3 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                        placeholder="+234 ..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Email Address *</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="p-3 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Company / Brand (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="p-3 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Ad Requirements / Message</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="p-3 border border-gray-300 rounded focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"
                      placeholder="Tell us what you're looking to advertise..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="mt-4 bg-[#D4AF37] text-black font-bold text-lg py-4 rounded hover:bg-[#b5952f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </PublicBlogLayout>
  );
}
