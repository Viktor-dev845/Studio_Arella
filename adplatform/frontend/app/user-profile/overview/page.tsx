'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useAuthStore } from '@/store/authStore';
import { 
  Briefcase, 
  Mail, 
  Edit2, 
  User, 
  UserCheck, 
  RefreshCcw, 
  Users,
  FileText 
} from 'lucide-react';
import { theme } from '@/lib/theme';

export default function UserProfileOverview() {
  const { user } = useAuthStore();
  const [activeSidebar, setActiveSidebar] = useState('profile');
  const [activeTab, setActiveTab] = useState('personal');

  // Fallbacks to match the Figma design precisely if user data is missing
  const firstName = user?.first_name || 'Robert';
  const lastName = user?.last_name || 'Johnson';
  const email = user?.email || 'robert.j@example.com';
  const phone = user?.phone || '07025550122';
  const avatarUrl = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="w-full max-w-[1200px] mx-auto p-6 lg:p-10 pb-24">
          <h1 className="text-[24px] font-semibold text-[#16151C] mb-8">Profile Details</h1>

          {/* Avatar & Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <img 
                src={avatarUrl} 
                alt="Profile Avatar" 
                className="w-[100px] h-[100px] rounded-[10px] object-cover"
              />
              <div className="flex flex-col gap-2">
                <h2 className="text-[24px] font-semibold text-[#16151C]">{`${firstName} ${lastName}`}</h2>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 text-[#16151C] text-[16px] font-light">
                    <Briefcase size={20} strokeWidth={1.5} />
                    <span>Creator</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#16151C] text-[16px] font-light">
                    <Mail size={20} strokeWidth={1.5} />
                    <span>{email}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#c29f31] transition-colors text-black h-[50px] px-6 rounded-[6px] text-[16px] font-light shadow-sm">
              <Edit2 size={20} strokeWidth={1.5} />
              Edit Profile
            </button>
          </div>

          <div className="w-full h-[1px] bg-[#A2A1A8]/20 mb-10"></div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Inner Sidebar */}
            <div className="w-full lg:w-[242px] shrink-0">
              <div className="border border-[#A2A1A8]/20 rounded-[10px] overflow-hidden bg-white">
                <button 
                  onClick={() => setActiveSidebar('profile')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'profile' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <User size={20} strokeWidth={activeSidebar === 'profile' ? 2 : 1.5} />
                  <span className="text-[16px]">Profile</span>
                </button>
                
                <button 
                  onClick={() => setActiveSidebar('security')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'security' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <UserCheck size={20} strokeWidth={activeSidebar === 'security' ? 2 : 1.5} />
                  <span className="text-[16px]">Security & privacy</span>
                </button>
                
                <button 
                  onClick={() => setActiveSidebar('transfers')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'transfers' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <RefreshCcw size={20} strokeWidth={activeSidebar === 'transfers' ? 2 : 1.5} />
                  <span className="text-[16px]">Transfers</span>
                </button>

                <button 
                  onClick={() => setActiveSidebar('retirement')}
                  className={`w-full flex items-center gap-3 px-5 py-4 transition-colors ${
                    activeSidebar === 'retirement' 
                      ? 'bg-[#D4AF37] text-black font-semibold' 
                      : 'bg-transparent text-[#16151C] font-light hover:bg-gray-50'
                  }`}
                >
                  <Users size={20} strokeWidth={activeSidebar === 'retirement' ? 2 : 1.5} />
                  <span className="text-[16px]">Retirement</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 max-w-[768px]">
              
              {/* Tabs */}
              <div className="flex flex-wrap gap-8 border-b border-[#A2A1A8]/20 mb-8 relative">
                <button 
                  onClick={() => setActiveTab('personal')}
                  className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                    activeTab === 'personal' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                  }`}
                >
                  <User size={20} strokeWidth={activeTab === 'personal' ? 2 : 1.5} />
                  Personal Information
                  {activeTab === 'personal' && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                  )}
                </button>
                
                <button 
                  onClick={() => setActiveTab('security_tab')}
                  className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                    activeTab === 'security_tab' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                  }`}
                >
                  <FileText size={20} strokeWidth={activeTab === 'security_tab' ? 2 : 1.5} />
                  Security & privacy
                  {activeTab === 'security_tab' && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                  )}
                </button>

                <button 
                  onClick={() => setActiveTab('details')}
                  className={`flex items-center gap-2.5 pb-3 relative transition-colors ${
                    activeTab === 'details' ? 'text-[#D4AF37] font-semibold text-[17px]' : 'text-[#16151C] font-light text-[17px] hover:text-gray-600'
                  }`}
                >
                  <RefreshCcw size={20} strokeWidth={activeTab === 'details' ? 2 : 1.5} />
                  Details
                  {activeTab === 'details' && (
                    <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#D4AF37]"></div>
                  )}
                </button>
              </div>

              {/* Form Grid */}
              {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">First Name</label>
                    <div className="text-[16px] text-[#16151C] font-light">{firstName}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Last Name</label>
                    <div className="text-[16px] text-[#16151C] font-light">{lastName}</div>
                  </div>
                  
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Mobile Number</label>
                    <div className="text-[16px] text-[#16151C] font-light">{phone}</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Email Address</label>
                    <div className="text-[16px] text-[#16151C] font-light">{email}</div>
                  </div>

                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Date of Birth</label>
                    <div className="text-[16px] text-[#16151C] font-light">July 14, 1995</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Marital Status</label>
                    <div className="text-[16px] text-[#16151C] font-light">Married</div>
                  </div>

                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Gender</label>
                    <div className="text-[16px] text-[#16151C] font-light">Female</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Nationality</label>
                    <div className="text-[16px] text-[#16151C] font-light">Nigerian</div>
                  </div>

                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">Address</label>
                    <div className="text-[16px] text-[#16151C] font-light">24, Royal Ln. Isi Court, Umuahia</div>
                  </div>
                  <div className="border-b border-[#A2A1A8]/10 pb-2">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">City</label>
                    <div className="text-[16px] text-[#16151C] font-light">Umuahia</div>
                  </div>

                  <div className="border-b border-[#A2A1A8]/10 pb-2 md:col-span-1">
                    <label className="text-[14px] text-[#A2A1A8] font-light block mb-1">State</label>
                    <div className="text-[16px] text-[#16151C] font-light">Abia</div>
                  </div>
                </div>
              )}

              {activeTab !== 'personal' && (
                <div className="py-12 text-center text-gray-500 font-light">
                  This section is under construction.
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
