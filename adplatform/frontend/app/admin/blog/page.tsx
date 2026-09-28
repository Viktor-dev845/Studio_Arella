'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/lib/theme';
import { Edit, Trash, Plus } from 'lucide-react';

export default function AdminBlogPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    } else {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blog/posts/admin');
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title, category, excerpt, content, image_url: imageUrl, status, author_name: user?.name || 'Admin'
    };

    try {
      if (editingPost) {
        await api.put(`/blog/posts/${editingPost.id}`, payload);
      } else {
        await api.post('/blog/posts', payload);
      }
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (err) {
      console.error('Error saving post', err);
      alert('Error saving post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/blog/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert('Error deleting post');
    }
  };

  const resetForm = () => {
    setTitle(''); setCategory(''); setExcerpt(''); setContent(''); setImageUrl(''); setStatus('draft'); setEditingPost(null);
  };

  const editPost = (post: any) => {
    setEditingPost(post);
    setTitle(post.title || '');
    setCategory(post.category || '');
    setExcerpt(post.excerpt || '');
    setContent(post.content || '');
    setImageUrl(post.image_url || '');
    setStatus(post.status || 'draft');
  };

  return (
    <DashboardLayout>
      <div style={{ padding: '40px', fontFamily: theme.font.body, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Blog Manager</h1>
          {!editingPost && (
            <button 
              onClick={() => editPost({})} 
              style={{ padding: '10px 20px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}
            >
              <Plus size={16} /> New Post
            </button>
          )}
        </div>

        {editingPost !== null ? (
          <div style={{ background: '#FFF', padding: 30, borderRadius: 12, border: '1px solid #E2E8F0' }}>
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>{editingPost.id ? 'Edit Post' : 'Create New Post'}</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1' }} placeholder="Post Title" />
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Category</label>
                  <input value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1' }} placeholder="e.g. Technology" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1' }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Cover Image URL</label>
                <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1' }} placeholder="https://..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Excerpt (Short Summary)</label>
                <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1', height: 80 }} placeholder="Brief summary for the blog index..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>Content (Markdown-style: use ## for headings, empty lines for paragraphs)</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #CBD5E1', height: 400, fontFamily: 'monospace' }} placeholder="Write your post here..." />
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <button type="submit" style={{ padding: '12px 24px', background: '#D4AF37', color: '#000', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  Save Post
                </button>
                <button type="button" onClick={resetForm} style={{ padding: '12px 24px', background: '#F1F5F9', color: '#334155', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '16px 20px', fontSize: 14, color: '#64748B', fontWeight: 600 }}>Title</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, color: '#64748B', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, color: '#64748B', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, color: '#64748B', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '16px 20px', fontSize: 14, color: '#64748B', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading posts...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>No blog posts yet. Click New Post to get started!</td></tr>
                ) : (
                  posts.map(post => (
                    <tr key={post.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>{post.title}</td>
                      <td style={{ padding: '16px 20px', color: '#64748B' }}>{post.category || '-'}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                          background: post.status === 'published' ? '#DCFCE7' : '#F1F5F9',
                          color: post.status === 'published' ? '#166534' : '#475569'
                        }}>
                          {post.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748B', fontSize: 14 }}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button onClick={() => editPost(post)} style={{ background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', marginRight: 16 }}>
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
