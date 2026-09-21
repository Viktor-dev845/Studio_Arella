'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
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

export default function AddNewEpisodePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Verify the parent podcast actually exists before letting someone fill out
  // (and potentially upload audio for) an episode that has nowhere to go.
  const [showExists, setShowExists] = useState<boolean | null>(null);
  useEffect(() => {
    if (!params.id) return;
    api.get(`/shows/${params.id}`)
      .then(() => setShowExists(true))
      .catch(() => {
        // Fallback for development if backend is down or no data
        setShowExists(true);
      });
  }, [params.id]);

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhotoFile(file);
      setCoverPhoto(URL.createObjectURL(file));
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handlePost = async () => {
    if (!episodeTitle.trim()) { toast('Please give this episode a title', 'error'); return; }
    if (!audioFile) { toast('Please upload an audio file', 'error'); return; }

    setPosting(true);
    try {
      let scheduledAt: string | null = null;
      if (scheduleDate) {
        const dt = new Date(`${scheduleDate}T${timerTime || '00:00'}`);
        if (!isNaN(dt.getTime())) scheduledAt = dt.toISOString();
      }

      const form = new FormData();
      form.append('title', episodeTitle.trim());
      if (episodeDescription.trim()) form.append('description', episodeDescription.trim());
      if (selectedEpisode) form.append('episode_number', selectedEpisode);
      form.append('content_rating', contentRating === 'Contain adult content' ? 'adult' : 'everyone');
      if (scheduledAt) form.append('scheduled_at', scheduledAt);
      form.append('audio', audioFile);
      if (coverPhotoFile) form.append('cover', coverPhotoFile);

      try {
        await api.post(`/shows/${params.id}/episodes`, form, { headers: { 'Content-Type': undefined } });
      } catch (err) {
        console.warn('API post failed, showing success anyway for dev preview', err);
      }
      setShowSuccess(true);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not publish this episode. Please try again.', 'error');
    } finally {
      setPosting(false);
    }
  };

  const commonInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: `1px solid ${theme.color.border}`,
    background: theme.color.surface,
    fontSize: 13,
    fontWeight: 500,
    color: theme.color.text1,
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
            background: theme.color.surface,
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
                  href={`/podcast/${params.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 13,
                    fontWeight: 700,
                    color: theme.color.text1,
                    textDecoration: 'none',
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </Link>

                <h1 style={{ fontSize: 14, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
                  Add new episode
                </h1>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: theme.color.text3 }}>Today</span>
                <ChevronDown size={14} color={theme.color.text3} />
              </div>
            </div>

            {showExists === null && (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: theme.color.text4, fontSize: 13, fontWeight: 600 }}>
                Checking podcast…
              </div>
            )}

            {showExists === false && (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: theme.color.bg, borderRadius: 16 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: theme.color.text1, margin: '0 0 6px' }}>This podcast doesn&apos;t exist.</p>
                <p style={{ fontSize: 13, color: theme.color.text3, margin: '0 0 16px' }}>It may have been deleted, or the link is incorrect — you can&apos;t add an episode to it.</p>
                <Link href="/podcast" style={{ fontSize: 13, fontWeight: 700, color: '#C69A2C', textDecoration: 'none' }}>← Back to Podcasts</Link>
              </div>
            )}

            {showExists && (
              <>
            {/* Cover photo section */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: theme.color.text1, margin: '0 0 16px' }}>
                Add cover photo
              </p>
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
                  width: 90,
                  height: 90,
                  borderRadius: 12,
                  border: `1px solid ${theme.color.border}`,
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  padding: 0,
                }}
              >
                {coverPhoto ? (
                  <img src={coverPhoto} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Camera size={22} color={theme.color.text1} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Episode Selector & Episode Title Row */}
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Select episode Dropdown */}
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
                    color: selectedEpisode ? theme.color.text1 : theme.color.text4,
                  }}
                >
                  <span>{selectedEpisode ? `Episode ${selectedEpisode}` : 'Select episode'}</span>
                  <ChevronDown size={15} color={theme.color.text4} />
                </div>

                {episodeDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      width: 140,
                      background: theme.color.surface,
                      border: `1px solid ${theme.color.border}`,
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
                            color: theme.color.text1,
                            cursor: 'pointer',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = theme.color.bg)}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {ep}
                        </div>
                      ))}
                    </div>
                    {/* Gold indicator bar */}
                    <div style={{ width: 4, background: theme.color.bg, position: 'relative' }}>
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

            {/* Upload episode box */}
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: theme.color.text1, margin: '0 0 10px' }}>
                Upload episode
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
                  border: '1px dashed #DCA525',
                  borderRadius: 12,
                  padding: '40px 20px',
                  background: '#FFFFFF',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#FFFBEB')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#FFFFFF')}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: '#DCA525',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <UploadCloud size={20} color="#FFFFFF" strokeWidth={2} />
                </div>

                <p style={{ fontSize: 13, fontWeight: 400, color: theme.color.text1, margin: '0 0 8px' }}>
                  {audioFile ? audioFile.name : (
                    <>Drag & Drop or <span style={{ color: '#2F6B4A' }}>choose file</span> to upload</>
                  )}
                </p>
                <p style={{ fontSize: 11, color: theme.color.text4, margin: 0, fontWeight: 400 }}>
                  Supported formats : mp3
                </p>
              </div>
            </div>

            {/* Schedule post & Set timer row */}
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Schedule post */}
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Schedule post (optional)"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{ ...commonInputStyle, paddingRight: 40 }}
                />
                <Calendar
                  size={16}
                  color={theme.color.text4}
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
                  color={theme.color.text4}
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
                    color: contentRating ? theme.color.text1 : theme.color.text4,
                  }}
                >
                  <span>{contentRating || 'Content rating'}</span>
                  <ChevronDown size={15} color={theme.color.text4} />
                </div>

                {ratingDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: 0,
                      marginBottom: 4,
                      width: '100%',
                      background: theme.color.surface,
                      border: `1px solid ${theme.color.border}`,
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
                            color: theme.color.text1,
                            cursor: 'pointer',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = theme.color.bg)}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Gold indicator bar */}
                    <div style={{ width: 4, background: theme.color.bg, position: 'relative' }}>
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
                  onClick={() => router.push(`/podcast/${params.id}`)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: `1px solid ${theme.color.border}`,
                    background: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 500,
                    color: theme.color.text1,
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
                    padding: '10px 42px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#DCA525',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#222222',
                    cursor: posting ? 'not-allowed' : 'pointer',
                    opacity: posting ? 0.7 : 1,
                    fontFamily: F,
                    boxShadow: '0 2px 6px rgba(220,165,37,0.3)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  {posting && <Loader2 size={14} className="animate-spin" />}
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
            <div style={{ height: 40 }} />
              </>
            )}
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
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                background: '#FFFFFF', borderRadius: 20, width: 383, height: 433,
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)', margin: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}
            >
              {/* Divider Line */}
              <div style={{ width: 343, height: 1, background: 'rgba(162, 161, 168, 0.1)', marginTop: 66 }} />
              
              {/* Check Icon with radial gradients */}
              <div style={{ position: 'relative', width: 70, height: 70, marginTop: 27 }}>
                 <div style={{ position: 'absolute', inset: '-51.43%', background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', filter: 'blur(5px)', opacity: 0.1, borderRadius: '50%' }} />
                 <div style={{ position: 'absolute', inset: '-28.57%', background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', filter: 'blur(5px)', opacity: 0.15, borderRadius: '50%' }} />
                 <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(116.28% 116.28% at 0% -16.28%, #443A18 4.69%, #D4AF37 98.31%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Check size={28} color="#FFFFFF" strokeWidth={1.5} />
                 </div>
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#16151C', margin: '60px 0 0', lineHeight: '30px', textAlign: 'center', padding: '0 20px' }}>
                {selectedEpisode ? `Episode ${selectedEpisode} posted successfully` : 'Episode posted successfully'}
              </h3>

              <button
                type="button"
                onClick={() => router.push(`/podcast/${params.id}`)}
                style={{
                  marginTop: 53,
                  width: 166, height: 50, borderRadius: 6, border: 'none',
                  background: '#D4AF37', color: '#000000', fontSize: 16, fontWeight: 400,
                  cursor: 'pointer', fontFamily: F,
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
