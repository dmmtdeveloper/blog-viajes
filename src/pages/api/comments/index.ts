import { CommentService, authenticateUser } from '../../../lib';

export const prerender = false;

export async function POST(context) {
  try {
    // Authenticate the user
    const auth = await authenticateUser(context);
    
    if (!auth.isAuthenticated) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401 }
      );
    }
    
    const data = await context.request.json();
    
    const { content, postId } = data;
    
    // Validate input
    if (!content || !postId) {
      return new Response(
        JSON.stringify({ message: 'Content and postId are required' }),
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
        message: 'Comment created successfully',
        comment
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating comment:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to create comment' }),
      { status: 500 }
    );
  }
}

export async function GET({ url }) {
  try {
    const postId = url.searchParams.get('postId');
    
    if (!postId) {
      return new Response(
        JSON.stringify({ message: 'Post ID is required' }),
        { status: 400 }
      );
    }
    
    const comments = await CommentService.getPostComments(parseInt(postId));
    
    return new Response(
      JSON.stringify(comments),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    return new Response(
      JSON.stringify({ message: error.message || 'Failed to fetch comments' }),
      { status: 500 }
    );
  }
}
