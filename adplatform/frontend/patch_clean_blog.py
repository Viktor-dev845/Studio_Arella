import re

# Fix 1: Remove double layout from admin/blog/page.tsx
admin_blog_path = r'app\admin\blog\page.tsx'
with open(admin_blog_path, 'r', encoding='utf-8') as f:
    admin_content = f.read()

admin_content = admin_content.replace(
    "import DashboardLayout from '@/components/layout/DashboardLayout';",
    ""
)
admin_content = admin_content.replace(
    "<DashboardLayout>",
    "<>"
)
admin_content = admin_content.replace(
    "</DashboardLayout>",
    "</>"
)
with open(admin_blog_path, 'w', encoding='utf-8') as f:
    f.write(admin_content)


# Fix 2: Remove mock fallback from app/blog/page.tsx
public_blog_path = r'app\blog\page.tsx'
with open(public_blog_path, 'r', encoding='utf-8') as f:
    public_content = f.read()

# Replace setPosts(fetchedPosts.length > 0 ? fetchedPosts : MOCK_POSTS) with setPosts(fetchedPosts)
public_content = public_content.replace(
    "setPosts(fetchedPosts.length > 0 ? fetchedPosts : MOCK_POSTS);",
    "setPosts(fetchedPosts);"
)
# And the catch block
public_content = public_content.replace(
    "setPosts(MOCK_POSTS);",
    "setPosts([]);"
)
# And the destructuring
public_content = public_content.replace(
    "const [featured, ...rest] = posts.length > 0 ? posts : MOCK_POSTS;",
    "const [featured, ...rest] = posts;"
)

# And if there's no featured post, we shouldn't render the featured block or the grid for rest if empty
# Actually React will just safely render nothing if featured is undefined, but the JSX expects featured.imageUrl
# Let's replace the grid rendering to handle empty states gracefully.
empty_state_html = """
          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <h2 className="text-2xl font-bold mb-2 text-black">Stay Tuned!</h2>
               <p className="text-gray-500">We are currently preparing some amazing content. Check back soon.</p>
            </div>
          ) : (
"""

public_content = public_content.replace(
    """          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading...</p>
          ) : (""",
    empty_state_html
)


with open(public_blog_path, 'w', encoding='utf-8') as f:
    f.write(public_content)

print("Fixed layout and removed mock posts.")
