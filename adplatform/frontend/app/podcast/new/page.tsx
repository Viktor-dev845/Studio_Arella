'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronDown,
  Camera,
  UploadCloud,
  Calendar,
  Clock,
  Check,
  Loader2,
} from 'lucide-react';
import { theme } from '@/lib/theme';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import PodcastRightPanel from '@/components/podcast/PodcastRightPanel';

const F = theme.font.body;

export default function AddPodcastPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [titleDescription, setTitleDescription] = useState('');

  const [selectedEpisode, setSelectedEpisode] = useState('');
  const [episodeDropdownOpen, setEpisodeDropdownOpen] = useState(false);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [timerTime, setTimerTime] = useState('');

  const [contentRating, setContentRating] = useState('');
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);

  const [posting, setPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdShowId, setCreatedShowId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhotoFile(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handlePost = async () => {
    if (!title.trim()) { toast('Please give your podcast a title', 'error'); return; }
    if (!episodeTitle.trim()) { toast('Please give episode 1 a title', 'error'); return; }
    if (!audioFile) { toast('Please upload an audio file for episode 1', 'error'); return; }

    setPosting(true);
    try {
      const showForm = new FormData();
      showForm.append('title', title.trim());
      if (titleDescription.trim()) showForm.append('description', titleDescription.trim());
      if (coverPhotoFile) showForm.append('cover', coverPhotoFile);

      const showRes = await api.post('/shows', showForm, { headers: { 'Content-Type': undefined } });
      const showId = showRes.data.podcast.id;

      let scheduledAt: string | null = null;
      if (scheduleDate) {
        const dt = new Date(`${scheduleDate}T${timerTime || '00:00'}`);
        if (!isNaN(dt.getTime())) scheduledAt = dt.toISOString();
      }

      const episodeForm = new FormData();
      episodeForm.append('title', episodeTitle.trim());
      if (episodeDescription.trim()) episodeForm.append('description', episodeDescription.trim());
      if (selectedEpisode) episodeForm.append('episode_number', selectedEpisode);
      episodeForm.append('content_rating', contentRating === 'Contain adult content' ? 'adult' : 'everyone');
      if (scheduledAt) episodeForm.append('scheduled_at', scheduledAt);
      episodeForm.append('audio', audioFile);
      if (coverPhotoFile) episodeForm.append('cover', coverPhotoFile);

      await api.post(`/shows/${showId}/episodes`, episodeForm, { headers: { 'Content-Type': undefined } });

      setCreatedShowId(showId);
      setShowSuccess(true);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not publish your podcast. Please try again.', 'error');
    } finally {
      setPosting(false);
    }
  };

  const commonInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    fontSize: 13,
    fontWeight: 500,
    color: '#0F172A',
    fontFamily: F,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div
          style={{
            fontFamily: F,
            padding: '24px 32px 48px',
            background: '#FFFFFF',
            minHeight: '100%',
            display: 'flex',
            gap: 36,
            alignItems: 'flex-start',
          }}
        >
          {/* ─── MAIN COLUMN ─── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link
                  href="/podcast"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0F172A',
                    textDecoration: 'none',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </Link>

                <h1 style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Add podcast
                </h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Today</span>
                <ChevronDown size={14} color="#64748B" />
              </div>
            </div>

            {/* Cover photo section */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCoverPhotoUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {coverPhotoPreview ? (
                  <img src={coverPhotoPreview} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={22} color="#94A3B8" strokeWidth={1.75} />
                )}
              </button>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '10px 0 0' }}>
                Add cover photo
              </p>
            </div>

            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={commonInputStyle}
              />
            </div>

            {/* Title description Textarea */}
            <div>
              <textarea
                placeholder="Title description"
                value={titleDescription}
                onChange={(e) => setTitleDescription(e.target.value)}
                style={{
                  ...commonInputStyle,
                  minHeight: 110,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Episode Selector & Episode Title Row */}
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Select episode (optional) Dropdown */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div
                  onClick={() => setEpisodeDropdownOpen(!episodeDropdownOpen)}
                  style={{
                    ...commonInputStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: selectedEpisode ? '#0F172A' : '#94A3B8',
                  }}
                >
                  <span>{selectedEpisode ? `Episode ${selectedEpisode}` : 'Select episode (optional)'}</span>
                  <ChevronDown size={15} color="#94A3B8" />
                </div>

                {episodeDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      width: 140,
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      zIndex: 20,
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <div style={{ flex: 1, padding: '4px 0' }}>
                      {['1', '2', '3'].map((ep) => (
                        <div
                          key={ep}
                          onClick={() => {
                            setSelectedEpisode(ep);
                            setEpisodeDropdownOpen(false);
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#0F172A',
                            cursor: 'pointer',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {ep}
                        </div>
                      ))}
                    </div>
                    {/* Gold indicator bar matching screenshot */}
                    <div style={{ width: 4, background: '#F8FAFC', position: 'relative' }}>
                      <div
                        style={{
                          width: 3,
                          height: 16,
                          background: '#CCA336',
                          borderRadius: 2,
                          position: 'absolute',
                          top: 8,
                          right: 1,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Episode Title Input */}
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Episode title"
                  value={episodeTitle}
                  onChange={(e) => setEpisodeTitle(e.target.value)}
                  style={commonInputStyle}
                />
              </div>
            </div>

            {/* Episode description Textarea */}
            <div>
              <textarea
                placeholder="Episode description"
                value={episodeDescription}
                onChange={(e) => setEpisodeDescription(e.target.value)}
                style={{
                  ...commonInputStyle,
                  minHeight: 110,
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Upload podcast box */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 10px' }}>
                Upload podcast
              </p>

              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioUpload}
                accept="audio/*"
                style={{ display: 'none' }}
              />

              <div
                onClick={() => audioInputRef.current?.click()}
                style={{
                  border: '1.5px dashed #CCA336',
                  borderRadius: 12,
                  padding: '30px 20px',
                  background: '#FFFDF9',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#FFFBEB')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#FFFDF9')}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#CCA336',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}
                >
                  <UploadCloud size={16} color="#FFFFFF" strokeWidth={2.5} />
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                  {audioFile ? audioFile.name : 'Drag & Drop or choose file to upload'}
                </p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: 0, fontWeight: 500 }}>
                  Supported formats : mp3
                </p>
              </div>
            </div>

            {/* Schedule podcast post & Set timer row */}
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Schedule post */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Schedule podcast post (optional)"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{ ...commonInputStyle, paddingRight: 40 }}
                />
                <Calendar
                  size={16}
                  color="#94A3B8"
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>

              {/* Set timer */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Set timer (optional)"
                  value={timerTime}
                  onChange={(e) => setTimerTime(e.target.value)}
                  style={{ ...commonInputStyle, paddingRight: 40 }}
                />
                <Clock
                  size={16}
                  color="#94A3B8"
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {/* Bottom Row: Content rating and Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 4,
                position: 'relative',
              }}
            >
              {/* Content rating Dropdown */}
              <div style={{ width: '48%', position: 'relative' }}>
                <div
                  onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
                  style={{
                    ...commonInputStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    color: contentRating ? '#0F172A' : '#94A3B8',
                  }}
                >
                  <span>{contentRating || 'Content rating'}</span>
                  <ChevronDown size={15} color="#94A3B8" />
                </div>

                {ratingDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: 4,
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      zIndex: 20,
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    <div style={{ flex: 1, padding: '4px 0' }}>
                      {['Suitable for everyone', 'Contain adult content'].map((item) => (
                        <div
                          key={item}
                          onClick={() => {
                            setContentRating(item);
                            setRatingDropdownOpen(false);
                          }}
                          style={{
                            padding: '9px 16px',
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: '#0F172A',
                            cursor: 'pointer',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Gold indicator bar */}
                    <div style={{ width: 4, background: '#F8FAFC', position: 'relative' }}>
                      <div
                        style={{
                          width: 3,
                          height: 16,
                          background: '#CCA336',
                          borderRadius: 2,
                          position: 'absolute',
                          top: 8,
                          right: 1,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => router.push('/podcast')}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#0F172A',
                    cursor: 'pointer',
                    fontFamily: F,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePost}
                  disabled={posting}
                  style={{
                    padding: '10px 32px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#CCA336',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: posting ? 'not-allowed' : 'pointer',
                    opacity: posting ? 0.7 : 1,
                    fontFamily: F,
                    boxShadow: '0 2px 6px rgba(204,163,54,0.3)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {posting && <Loader2 size={14} className="animate-spin" />}
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN (Promos) ─── */}
          <PodcastRightPanel variant="promos" />
        </div>

        {/* Posted successfully modal */}
        {showSuccess && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)',
            }}
          >
            <div
              style={{
                background: '#FFFFFF', borderRadius: 24, padding: '40px 32px 32px',
                textAlign: 'center', maxWidth: 340, width: '100%', margin: 16,
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              }}
            >
              <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 24px' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#CCA336', opacity: 0.25, filter: 'blur(18px)' }} />
                <div
                  style={{
                    position: 'relative', width: 64, height: 64, margin: '12px auto 0',
                    borderRadius: '50%', background: '#9E7B21',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(158,123,33,0.35)',
                  }}
                >
                  <Check size={28} color="#FFFFFF" strokeWidth={3} />
                </div>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 24px' }}>
                Your podcast was a success
              </h3>
              <button
                type="button"
                onClick={() => createdShowId && router.push(`/podcast/${createdShowId}`)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                  background: '#CCA336', color: '#FFFFFF', fontSize: 13, fontWeight: 800,
                  cursor: 'pointer', fontFamily: F, boxShadow: '0 2px 6px rgba(204,163,54,0.3)',
                }}
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  );
}
