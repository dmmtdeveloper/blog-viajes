import { PostService, authenticateUser } from "../../../lib";
import type { APIContext } from "astro";

export const prerender = false;

export async function GET({ request, url }: { request: Request; url: URL }) {
  try {
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const categoryId = url.searchParams.get("categoryId")
      ? parseInt(url.searchParams.get("categoryId") || "0")
      : undefined;

    const { posts, total } = await PostService.getPublishedPosts(
      page,
      limit,
      categoryId
    );

    return new Response(
      JSON.stringify({
        posts,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching posts:", error);

    return new Response(
      JSON.stringify({ message: error.message || "Failed to fetch posts" }),
      { status: 500 }
    );
  }
}

export async function POST(context: APIContext) {
  try {
    // Authenticate the user
    const auth = await authenticateUser(context);

    if (!auth.isAuthenticated) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await context.request.json();

    const { title, content, imageUrl, location, published, categoryIds } = data;

    // Validate input
    if (!title || !content) {
      return new Response(
        JSON.stringify({ message: "Title and content are required" }),
        { status: 400 }
      );
    }

    // Create a new post
    const post = await PostService.createPost({
      title,
      content,
      imageUrl,
      location,
      published: published || false,
      authorId: auth.userId!,
      categoryIds,
    });
    return new Response(
      JSON.stringify({
        message: "Post created successfully",
        post,
      }),
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating post:", error);

    return new Response(
      JSON.stringify({ message: error.message || "Failed to create post" }),
      { status: 500 }
    );
  }
}
