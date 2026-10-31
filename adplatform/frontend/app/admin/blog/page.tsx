'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import { PageTransition, Skeleton } from '@/components/ui/Animations';
import { Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import StatusBadge from '@/components/ui/StatusBadge';
import { theme } from '@/lib/theme';
import { FileText, Plus, Edit, Trash2, ExternalLink, Search, X, Check, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const F = theme.font.body;
const card = { background: theme.color.surface, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' } as React.CSSProperties;

export default function AdminBlogPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form State
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blog/posts/admin');
      setPosts(res.data.posts || []);
    } catch (err) {
      toast('Failed to load blog posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast('Title and content are required', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      category: category.trim() || 'General',
      excerpt: excerpt.trim() || title,
      content,
      image_url: imageUrl.trim() || undefined,
      status,
      author_name: user?.name || 'Studio Arella Team',
    };

    try {
      if (editingPost && editingPost.id) {
        await api.put(`/blog/posts/${editingPost.id}`, payload);
        toast('Post updated successfully', 'success');
      } else {
        await api.post('/blog/posts', payload);
        toast('Post published successfully', 'success');
      }
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Error saving post', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/blog/posts/${deleteTarget.id}`);
      toast('Post deleted successfully', 'success');
      setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Error deleting post', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setExcerpt('');
    setContent('');
    setImageUrl('');
    setStatus('published');
    setEditingPost(null);
  };

  const openEdit = (post: any) => {
    setEditingPost(post);
    setTitle(post.title || '');
    setCategory(post.category || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setImageUrl(post.image_url || '');
    setStatus(post.status || 'published');
  };

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    const matchSearch =
      (p.title || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <PageTransition>
      <div style={{ fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ padding: '8px', background: theme.color.goldLight, borderRadius: theme.radius.md, display: 'flex' }}>
                <FileText size={20} color={theme.color.goldDark} />
              </div>
              <h1 style={{ fontFamily: theme.font.display, fontSize: 26, fontWeight: 700, color: theme.color.text1, margin: 0, letterSpacing: '-0.02em' }}>Blog & Editorial Manager</h1>
            </div>
            <p style={{ fontSize: 13, color: theme.color.text3, margin: 0 }}>
              {posts.length} articles published and managed across Studio Arella
            </p>
          </div>

          {!editingPost && (
            <button
              onClick={() => openEdit({})}
              style={{
                padding: '10px 18px',
                background: theme.color.gold,
                color: theme.color.charcoal900,
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: theme.shadow.gold
              }}
            >
              <Plus size={14} /> New Post
            </button>
          )}
        </div>

        {/* Create / Edit Form view */}
        {editingPost !== null ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...card, padding: 28, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: `1px solid ${theme.color.border2}`, paddingBottom: 14 }}>
              <h2 style={{ fontFamily: theme.font.display, fontSize: 20, fontWeight: 700, color: theme.color.text1, margin: 0 }}>
                {editingPost.id ? 'Edit Article' : 'Create New Article'}
              </h2>
              <button onClick={resetForm} style={{ background: 'none', border: 'none', color: theme.color.text3, cursor: 'pointer', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                  Title *
                </label>
                <input
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 5 DOOH Advertising Trends Dominating in 2026"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${theme.color.border}`,
                    background: theme.color.surface,
                    color: theme.color.text1,
                    fontSize: 14,
                    fontFamily: F,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Media, Technology, Creative"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1.5px solid ${theme.color.border}`,
                      background: theme.color.surface,
                      color: theme.color.text1,
                      fontSize: 13,
                      fontFamily: F,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: `1.5px solid ${theme.color.border}`,
                      background: theme.color.surface,
                      color: theme.color.text1,
                      fontSize: 13,
                      fontFamily: F,
                      outline: 'none',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                  Cover Image URL
                </label>
                <div style={{ position: 'relative' }}>
                  <ImageIcon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or uploaded asset path"
                    style={{
                      width: '100%',
                      paddingLeft: 36,
                      paddingRight: 14,
                      paddingTop: 10,
                      paddingBottom: 10,
                      borderRadius: 8,
                      border: `1.5px solid ${theme.color.border}`,
                      background: theme.color.surface,
                      color: theme.color.text1,
                      fontSize: 13,
                      fontFamily: F,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                  Excerpt (Short Summary) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={excerpt}
                  onChange={e => setExcerpt(e.target.value)}
                  placeholder="Brief synopsis for blog listing cards and social sharing..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${theme.color.border}`,
                    background: theme.color.surface,
                    color: theme.color.text1,
                    fontSize: 13,
                    fontFamily: F,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: theme.color.text2, marginBottom: 6 }}>
                  Content (Markdown supported) *
                </label>
                <textarea
                  required
                  rows={12}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="## Heading\n\nWrite your blog post article content here..."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1.5px solid ${theme.color.border}`,
                    background: theme.color.surface,
                    color: theme.color.text1,
                    fontSize: 13,
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    background: theme.color.surface2,
                    color: theme.color.text2,
                    border: `1px solid ${theme.color.border}`,
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    background: theme.color.gold,
                    color: theme.color.charcoal900,
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Check size={14} /> {saving ? 'Saving...' : editingPost.id ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : null}

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: theme.color.text3 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts by title, category, or excerpt..."
              style={{
                width: '100%',
                paddingLeft: 36,
                paddingRight: 14,
                paddingTop: 10,
                paddingBottom: 10,
                background: theme.color.surface,
                border: `1.5px solid ${theme.color.border}`,
                borderRadius: 9,
                color: theme.color.text1,
                fontSize: 13,
                outline: 'none',
                fontFamily: F,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'published', 'draft'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: `1px solid ${statusFilter === s ? theme.color.gold : theme.color.border}`,
                  background: statusFilter === s ? theme.color.gold : theme.color.surface,
                  color: statusFilter === s ? theme.color.charcoal900 : theme.color.text2,
                  textTransform: 'capitalize'
                }}
              >
                {s === 'all' ? 'All Posts' : s}
              </button>
            ))}
          </div>
        </div>

        <div style={card}>
          <Table>
            <TableHead>
              {['Article', 'Category', 'Status', 'Date Published', 'Actions'].map(h => (
                <TableHeaderCell key={h}>{h}</TableHeaderCell>
              ))}
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => <td key={j} style={{ padding: '14px 16px' }}><Skeleton height={12} width={j === 0 ? 140 : 80} /></td>)}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: theme.color.text3 }}>No blog posts found</td></tr>
              ) : (
                filtered.map(post => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {post.image_url ? (
                          <div style={{ width: 44, height: 32, borderRadius: 6, overflow: 'hidden', background: theme.color.surface2, flexShrink: 0 }}>
                            <img src={post.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : null}
                        <div>
                          <span style={{ fontWeight: 700, color: theme.color.text1, display: 'block' }}>{post.title}</span>
                          <span style={{ fontSize: 11, color: theme.color.text3 }}>By {post.author_name || 'Studio Arella'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span style={{ background: theme.color.surface2, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: theme.color.text2 }}>
                        {post.category || 'General'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status === 'published' ? 'active' : 'draft'} />
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: 12, color: theme.color.text3 }}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <a
                          href={`/blog/${post.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on site"
                          style={{
                            color: theme.color.text3,
                            display: 'flex',
                            padding: 4,
                            textDecoration: 'none'
                          }}
                          onMouseOver={e => (e.currentTarget.style.color = theme.color.gold)}
                          onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => openEdit(post)}
                          title="Edit post"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.color.text3,
                            cursor: 'pointer',
                            display: 'flex',
                            padding: 4
                          }}
                          onMouseOver={e => (e.currentTarget.style.color = theme.color.gold)}
                          onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          title="Delete post"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.color.text3,
                            cursor: 'pointer',
                            display: 'flex',
                            padding: 4
                          }}
                          onMouseOver={e => (e.currentTarget.style.color = theme.color.error)}
                          onMouseOut={e => (e.currentTarget.style.color = theme.color.text3)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteTarget(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, backdropFilter: 'blur(4px)' }}
              />
              <div style={{ position: 'fixed', inset: 0, zIndex: 111, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 16 }}
                  style={{ background: theme.color.surface, width: '100%', maxWidth: 400, borderRadius: 16, border: `1px solid ${theme.color.border}`, overflow: 'hidden', boxShadow: theme.shadow.lg, fontFamily: F, textAlign: 'center', padding: 24 }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.color.errorLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Trash2 size={20} color={theme.color.error} />
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: theme.color.text1 }}>Delete Article?</h3>
                  <p style={{ margin: '0 0 20px', fontSize: 13, color: theme.color.text3, lineHeight: 1.5 }}>
                    "{deleteTarget.title}" will be permanently removed from the blog.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setDeleteTarget(null)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: theme.color.surface2,
                        color: theme.color.text2,
                        border: `1px solid ${theme.color.border}`,
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: theme.color.error,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        opacity: deleting ? 0.7 : 1
                      }}
                    >
                      {deleting ? 'Deleting…' : 'Delete Article'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
