---
import { CommentService } from '../../../lib/commentService';
import { authenticateUser } from '../../../lib/middleware';

export const prerender = false;

// Create a new comment
if (Astro.request.method === 'POST') {
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
    
    const { content, postId } = data;
    
    // Validate input
    if (!content) {
      return new Response(
        JSON.stringify({ message: 'Comment content is required' }),
        { status: 400 }
      );
    }
    
    if (!postId) {
      return new Response(
        JSON.stringify({ message: 'Post ID is required' }),
        { status: 400 }
      );
    }
    
    // Create a new comment
    const comment = await CommentService.createComment({
      content,
      postId,
      authorId: auth.userId!,
    });
    
    return new Response(
      JSON.stringify({
        message: 'Comment added successfully',
        comment
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating comment:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to create comment' }),
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
