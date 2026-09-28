import re

filepath = r'app\blog\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Restore Mock Posts for visual testing
mock_posts_code = """
const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Bulvinar Neque Laoreet Suspendisse Interdum',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    category: 'HOT NOW',
    authorName: 'Jane Smith',
    imageUrl: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?q=80&w=1200&auto=format&fit=crop',
    publishedAt: '2023-11-17T00:00:00.000Z',
    likesCount: 14000,
    commentsCount: 204
  },
  {
    id: '2',
    title: 'Pellentesque Eliteget Bravida Cumsociis Natoque',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
    category: 'WORLD',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2023-11-16T00:00:00.000Z',
    likesCount: 2200,
    commentsCount: 60
  },
  {
    id: '3',
    title: 'Turpis Egestas Sed Tempus Urna Pharetra',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
    category: 'SCIENCE',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2023-11-15T00:00:00.000Z',
    likesCount: 6000,
    commentsCount: 92
  },
  {
    id: '4',
    title: 'Minulla Posuere Sollicitudin Aliquam Ultrices',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
    category: 'ECONOMY',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1492138723732-60d120096d14?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2023-11-14T00:00:00.000Z',
    likesCount: 10000,
    commentsCount: 124
  },
  {
    id: '5',
    title: 'Scelerisque Varius Morbi Enim Nunc Faucibus',
    excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
    category: 'TECHNOLOGY',
    authorName: 'Admin',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
    publishedAt: '2023-11-13T00:00:00.000Z',
    likesCount: 8000,
    commentsCount: 45
  }
];

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}
"""

if "const MOCK_POSTS" not in content:
    content = content.replace("function formatCount(n: number)", mock_posts_code)

# We want the effect to temporarily inject MOCK_POSTS so we can see it.
# We will just change setPosts([]) to setPosts(MOCK_POSTS) in the effect.
# Or if fetchedPosts.length === 0, setPosts(MOCK_POSTS)
effect_replacement = """
  useEffect(() => {
    api.get('/blog/posts?limit=20')
      .then((res) => {
        const fetchedPosts = res.data?.posts || [];
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : MOCK_POSTS);
      })
      .catch(() => {
        setPosts(MOCK_POSTS);
      })
      .finally(() => setLoading(false));
  }, []);
"""
content = re.sub(
    r'useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);',
    effect_replacement.strip(),
    content
)

# New Layout
new_jsx = """
  return (
    <PublicBlogLayout>
      <PageTransition>
        <div className="flex flex-col items-center w-full min-h-screen bg-[#F8F9FA] pb-[100px]">
          
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <h2 className="text-2xl font-bold mb-2 text-black">Stay Tuned!</h2>
               <p className="text-gray-500">We are currently preparing some amazing content. Check back soon.</p>
            </div>
          ) : (
            <div className="w-full max-w-[1300px] mx-auto px-4 lg:px-8 mt-10">
              
              {/* Category Badges Styling Component */}
              <style dangerouslySetInnerHTML={{__html: `
                .category-badge {
                  background-color: #0A0A0A;
                  color: #FFFFFF;
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                  padding: 6px 12px;
                  display: inline-block;
                }
                .hover-scale {
                  transition: transform 0.3s ease;
                }
                .group:hover .hover-scale {
                  transform: scale(1.03);
                }
              `}} />

              {/* Bento Box Hero Section */}
              {featured && (
                <div className="flex flex-col lg:flex-row gap-6 mb-16">
                  
                  {/* HUGE LEFT CARD - Breaking News */}
                  <Link href={`/blog/${featured.id}`} className="group relative w-full lg:w-2/3 h-[400px] lg:h-[600px] overflow-hidden bg-black flex-shrink-0 cursor-pointer">
                    <img 
                      src={featured.imageUrl || ""} 
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-80 hover-scale"
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-6 lg:p-12 w-full max-w-[800px]">
                      <div className="category-badge mb-4 bg-[#FF3B30]">{featured.category || 'BREAKING NEWS'}</div>
                      <h2 className="text-white font-bold text-[32px] lg:text-[48px] leading-[1.1] mb-4 drop-shadow-md" style={{ fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif' }}>
                        {featured.title}
                      </h2>
                      <p className="text-gray-200 text-[16px] lg:text-[18px] line-clamp-2 mb-6">
                        {featured.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-gray-300 text-sm font-semibold">
                        <span>{featured.authorName || 'Studio Arella'}</span>
                        <span>•</span>
                        <span>{featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                      </div>
                    </div>
                  </Link>

                  {/* RIGHT COLUMN - Popular Now Grid (4 items) */}
                  <div className="w-full lg:w-1/3 flex flex-col gap-6 h-auto lg:h-[600px]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold border-b-2 border-black pb-1 inline-block">Popular Now</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 40px)' }}>
                      {rest.slice(0, 4).map((post) => (
                        <Link key={post.id} href={`/blog/${post.id}`} className="group flex gap-4 items-center">
                          <div className="relative w-[120px] h-[100px] flex-shrink-0 overflow-hidden bg-gray-200">
                            <img 
                              src={post.imageUrl || ""} 
                              alt={post.title}
                              className="absolute inset-0 w-full h-full object-cover hover-scale"
                            />
                            {post.category && (
                              <div className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 uppercase">
                                {post.category}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col justify-center">
                            <h4 className="font-bold text-[15px] leading-tight mb-2 group-hover:text-[#D4AF37] transition-colors line-clamp-3">
                              {post.title}
                            </h4>
                            <div className="text-gray-500 text-[11px] font-semibold">
                              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* EDITOR CHOICE (Masonry or standard grid) */}
              {rest.length > 4 && (
                <div className="mt-16">
                  <h3 className="text-2xl font-bold border-b-2 border-black pb-2 mb-8 inline-block">Editor's Choice</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {rest.slice(4).map((post) => (
                      <Link key={post.id} href={`/blog/${post.id}`} className="group flex flex-col gap-4">
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
                          <img 
                            src={post.imageUrl || ""} 
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover hover-scale"
                          />
                          {post.category && (
                            <div className="absolute bottom-4 left-4 category-badge">
                              {post.category}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-start gap-2">
                          <h4 className="font-bold text-[20px] leading-tight group-hover:text-[#D4AF37] transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-gray-500 text-[15px] line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="text-gray-400 text-xs mt-2 font-semibold uppercase tracking-wider">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </PageTransition>
    </PublicBlogLayout>
  );
"""

content = re.sub(
    r'  return \([\s\S]*?\);\n\}',
    new_jsx.strip() + '\n}',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated app/blog/page.tsx with Bento box layout")
