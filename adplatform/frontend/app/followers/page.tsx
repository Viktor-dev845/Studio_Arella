'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { PageTransition } from '@/components/ui/Animations';
import { useToast } from '@/components/ui/ToastProvider';
import api from '@/lib/api';
import { theme } from '@/lib/theme';

const F = theme.font.body;

interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  roleLabel: string;
  bio: string | null;
  businessName: string | null;
  followerCount: number;
  iFollowBack: boolean;
  isNew?: boolean;
}

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

function Avatar({ profile, size = 44 }: { profile: Profile; size?: number }) {
  if (profile.avatar) {
    return <img src={profile.avatar} alt={profile.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: theme.color.goldLight, color: theme.color.goldDark,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.36,
    }}>
      {getInitials(profile.name)}
    </div>
  );
}

function subtitleFor(p: Profile) {
  const bits: string[] = [];
  if (p.bio) bits.push(p.bio);
  else if (p.businessName) bits.push(p.businessName);
  else bits.push(p.roleLabel);
  bits.push(`${p.followerCount.toLocaleString()} follower${p.followerCount === 1 ? '' : 's'}`);
  return bits.join(' · ');
}

export default function FollowersPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'followers' | 'following'>('followers');
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const fetchFollowers = async () => {
    try {
      const res = await api.get('/follows/followers');
      setFollowers(res.data?.followers || []);
    } catch {
      toast('Could not load followers. Please refresh.', 'error');
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await api.get('/follows/following');
      setFollowing(res.data?.following || []);
    } catch {
      toast('Could not load who you follow. Please refresh.', 'error');
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFollowers(), fetchFollowing()]).finally(() => setLoading(false));
  }, []);

  const follow = async (userId: string) => {
    setPending((p) => ({ ...p, [userId]: true }));
    try {
      await api.post(`/follows/${userId}`);
      setFollowers((prev) => prev.map((f) => (f.id === userId ? { ...f, iFollowBack: true } : f)));
      const target = followers.find((f) => f.id === userId);
      if (target) setFollowing((prev) => (prev.some((f) => f.id === userId) ? prev : [{ ...target, iFollowBack: true }, ...prev]));
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not follow this user. Please try again.', 'error');
    } finally {
      setPending((p) => ({ ...p, [userId]: false }));
    }
  };

  const unfollow = async (userId: string) => {
    setPending((p) => ({ ...p, [userId]: true }));
    try {
      await api.delete(`/follows/${userId}`);
      setFollowers((prev) => prev.map((f) => (f.id === userId ? { ...f, iFollowBack: false } : f)));
      setFollowing((prev) => prev.filter((f) => f.id !== userId));
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Could not unfollow this user. Please try again.', 'error');
    } finally {
      setPending((p) => ({ ...p, [userId]: false }));
    }
  };

  const FollowButton = ({ p }: { p: Profile }) => (
    <button
      onClick={() => (p.iFollowBack ? unfollow(p.id) : follow(p.id))}
      disabled={!!pending[p.id]}
      style={{
        padding: '7px 18px',
        borderRadius: theme.radius.pill,
        fontSize: 12,
        fontWeight: 800,
        cursor: pending[p.id] ? 'not-allowed' : 'pointer',
        opacity: pending[p.id] ? 0.6 : 1,
        border: p.iFollowBack ? `1px solid ${theme.color.border}` : 'none',
        background: p.iFollowBack ? theme.color.surface : theme.color.gold,
        color: p.iFollowBack ? theme.color.text2 : theme.color.charcoal900,
        whiteSpace: 'nowrap',
      }}
    >
      {p.iFollowBack ? 'Following' : 'Follow'}
    </button>
  );

  const newFollowers = followers.filter((f) => f.isNew);

  return (
    <DashboardLayout>
      <PageTransition>
        <div style={{ fontFamily: F, maxWidth: 900, margin: '0 auto', padding: '8px 4px' }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: theme.color.text1, margin: '0 0 20px' }}>Followers</h1>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['followers', 'following'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: theme.radius.sm,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  background: tab === t ? theme.color.gold : theme.color.surface2,
                  color: tab === t ? theme.color.charcoal900 : theme.color.text3,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: theme.color.text3, padding: '40px 0' }}>Loading…</p>
          ) : tab === 'followers' ? (
            <>
              {newFollowers.length > 0 && (
                <>
                  <p style={{ fontSize: 12, fontWeight: 800, color: theme.color.gold, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                    You have {newFollowers.length} new follower{newFollowers.length === 1 ? '' : 's'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {newFollowers.map((p) => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.md }}>
                        <Avatar profile={p} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: theme.color.text1 }}>{p.name}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: theme.color.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitleFor(p)}</p>
                        </div>
                        <FollowButton p={p} />
                      </div>
                    ))}
                  </div>
                  <hr style={{ border: 'none', borderTop: `1px solid ${theme.color.border}`, margin: '0 0 20px' }} />
                </>
              )}

              <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 800, color: theme.color.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>
                Your followers
              </p>

              {followers.length === 0 ? (
                <p style={{ textAlign: 'center', color: theme.color.text3, padding: '30px 0' }}>No one follows you yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {followers.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar profile={p} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: theme.color.text1 }}>{p.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: theme.color.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitleFor(p)}</p>
                      </div>
                      <FollowButton p={p} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 800, color: theme.color.text3, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 16 }}>
                Following
              </p>
              {following.length === 0 ? (
                <p style={{ textAlign: 'center', color: theme.color.text3, padding: '30px 0' }}>You&apos;re not following anyone yet — follow someone back from your Followers tab.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {following.map((p) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar profile={p} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: theme.color.text1 }}>{p.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: theme.color.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitleFor(p)}</p>
                      </div>
                      <FollowButton p={p} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
