import {
  PostService,
  authenticateUser,
  isAdmin,
  isSameUserOrAdmin,
} from "../../../lib";
import type { APIContext } from "astro";

export const prerender = false;

export async function GET({ params }: { params: { id: string } }) {
  const postId = parseInt(params.id || "0");

  if (!postId) {
    return new Response(JSON.stringify({ message: "Invalid post ID" }), {
      status: 400,
    });
  }

  try {
    const post = await PostService.getPostById(postId);

    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching post ${postId}:`, error);

    return new Response(
      JSON.stringify({ message: error.message || "Failed to fetch post" }),
      { status: 500 }
    );
  }
}

export async function PUT(context: APIContext) {
  const postId = parseInt(context.params.id || "0");

  if (!postId) {
    return new Response(JSON.stringify({ message: "Invalid post ID" }), {
      status: 400,
    });
  }

  try {
    // Authenticate the user
    const auth = await authenticateUser(context);

    if (!auth.isAuthenticated) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get the post to check permissions
    const post = await PostService.getPostById(postId);

    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
      });
    }

    // Check if the user is the author or an admin
    if (!isSameUserOrAdmin(auth.userId!, post.author.id, auth.roleId!)) {
      return new Response(
        JSON.stringify({
          message: "Forbidden: You can only update your own posts",
        }),
        { status: 403 }
      );
    }

    const data = await context.request.json();

    // Update the post
    const updatedPost = await PostService.updatePost(
      postId,
      auth.userId!,
      data
    );

    return new Response(
      JSON.stringify({
        message: "Post updated successfully",
        post: updatedPost,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);

    return new Response(
      JSON.stringify({ message: error instanceof Error ? error.message : "Failed to update post" }),
      { status: 500 }
    );
  }
}

// Interfaces
interface DeleteContext extends APIContext {
    params: {
        id: string;
    };
}

interface ErrorResponse {
    message: string;
}

interface SuccessResponse {
    message: string;
}

export async function DELETE(context: DeleteContext): Promise<Response> {
    const postId: number = parseInt(context.params.id || "0");

    if (!postId) {
        return new Response(JSON.stringify({ message: "Invalid post ID" } as ErrorResponse), {
            status: 400,
        });
    }

    try {
        // Authenticate the user
        const auth = await authenticateUser(context);

        if (!auth.isAuthenticated) {
            return new Response(JSON.stringify({ message: "Unauthorized" } as ErrorResponse), {
                status: 401,
            });
        }

        // Get the post to check permissions
        const post = await PostService.getPostById(postId);

        if (!post) {
            return new Response(JSON.stringify({ message: "Post not found" } as ErrorResponse), {
                status: 404,
            });
        }

        // Check if the user is the author or an admin
        if (!isSameUserOrAdmin(auth.userId!, post.author.id, auth.roleId!)) {
            return new Response(
                JSON.stringify({
                    message: "Forbidden: You can only delete your own posts",
                } as ErrorResponse),
                { status: 403 }
            );
        }

        // Delete the post
        await PostService.deletePost(postId, auth.userId!);

        return new Response(
            JSON.stringify({ message: "Post deleted successfully" } as SuccessResponse),
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error(`Error deleting post ${postId}:`, error);

        return new Response(
            JSON.stringify({ 
                message: error instanceof Error ? error.message : "Failed to delete post" 
            } as ErrorResponse),
            { status: 500 }
        );
    }
}
