---
import { PostService } from '../../../lib/postService';
import { authenticateUser, isAdmin, isSameUserOrAdmin } from '../../../lib/middleware';

export const prerender = false;

// Get, update, or delete a specific post
const { id } = Astro.params;
const postId = parseInt(id || '0');

if (!postId) {
  return new Response(
    JSON.stringify({ message: 'Invalid post ID' }),
    { status: 400 }
  );
}

// Get a specific post
if (Astro.request.method === 'GET') {
  try {
    const post = await PostService.getPostById(postId);
    
    if (!post) {
      return new Response(
        JSON.stringify({ message: 'Post not found' }),
        { status: 404 }
      );
    }
    
    return new Response(
      JSON.stringify({ post }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching post:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to fetch post' }),
      { status: 500 }
    );
  }
} 
// Update a specific post
else if (Astro.request.method === 'PUT') {
  try {
    // Authenticate the user
    const auth = await authenticateUser(Astro);
    
    if (!auth.isAuthenticated) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    const data = await Astro.request.json();
    
    const { title, content, imageUrl, location, published, categoryIds } = data;
    
    // Update the post
    try {
      const updatedPost = await PostService.updatePost(
        postId,
        auth.userId!,
        {
          title,
          content,
          imageUrl,
          location,
          published,
          categoryIds,
        }
      );
      
      return new Response(
        JSON.stringify({
          message: 'Post updated successfully',
          post: updatedPost
        }),
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === 'Not authorized to update this post') {
        return new Response(
          JSON.stringify({ message: error.message }),
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error updating post:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to update post' }),
      { status: 500 }
    );
  }
} 
// Delete a specific post
else if (Astro.request.method === 'DELETE') {
  try {
    // Authenticate the user
    const auth = await authenticateUser(Astro);
    
    if (!auth.isAuthenticated) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    // Check if user is admin or post author
    try {
      await PostService.deletePost(postId, auth.userId!);
      
      return new Response(
        JSON.stringify({
          message: 'Post deleted successfully'
        }),
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === 'Not authorized to delete this post') {
        return new Response(
          JSON.stringify({ message: error.message }),
          { status: 403 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error deleting post:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to delete post' }),
      { status: 500 }
    );
  }
} else {
  return new Response(
    JSON.stringify({ message: 'Method not allowed' }),
    { status: 405 }
  );
}
---
