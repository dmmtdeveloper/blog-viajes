import { prisma } from "./prisma";

// Post types
export interface PostCreateInput {
  title: string;
  content: string;
  imageUrl?: string;
  published?: boolean;
  location?: string;
  authorId: number;
  categoryIds?: number[];
}

export interface PostUpdateInput {
  title?: string;
  content?: string;
  imageUrl?: string;
  published?: boolean;
  location?: string;
  categoryIds?: number[];
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  categories: {
    id: number;
    name: string;
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}

// Post service
export const PostService = {
  // Create a new post
  async createPost(data: PostCreateInput): Promise<PostResponse> {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        published: data.published || false,
        location: data.location,
        author: {
          connect: { id: data.authorId },
        },
        categories: data.categoryIds
          ? {
              connect: data.categoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return post;
  },

  // Get all published posts with pagination
  async getPublishedPosts(
    page: number = 1,
    limit: number = 10,
    categoryId?: number
  ): Promise<{ posts: PostResponse[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = {
      published: true,
      ...(categoryId ? { categories: { some: { id: categoryId } } } : {}),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          categories: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return { posts, total };
  },

  // Get a post by ID
  async getPostById(postId: number): Promise<PostResponse | null> {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return post;
  },

  // Update a post
  async updatePost(
    postId: number,
    authorId: number,
    data: PostUpdateInput
  ): Promise<PostResponse> {
    // First check if the post belongs to the author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== authorId) {
      throw new Error("Not authorized to update this post");
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
        published: data.published,
        location: data.location,
        categories: data.categoryIds
          ? {
              set: [], // Clear existing connections
              connect: data.categoryIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return updatedPost;
  },

  // Delete a post
  async deletePost(postId: number, authorId: number): Promise<void> {
    // First check if the post belongs to the author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.authorId !== authorId) {
      throw new Error("Not authorized to delete this post");
    }

    await prisma.post.delete({
      where: { id: postId },
    });
  },

  // Get user's posts
  async getUserPosts(userId: number): Promise<PostResponse[]> {
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return posts;
  },
};
