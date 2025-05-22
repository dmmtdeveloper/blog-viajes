import { prisma } from "./prisma";

// Comment types
export interface CommentCreateInput {
  content: string;
  postId: number;
  authorId: number;
}

export interface CommentUpdateInput {
  content: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    name: string;
    profileImage: string | null;
  };
  postId: number;
}

// Comment service
export const CommentService = {
  // Create a new comment
  async createComment(data: CommentCreateInput): Promise<CommentResponse> {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        post: {
          connect: { id: data.postId },
        },
        author: {
          connect: { id: data.authorId },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return comment;
  },

  // Get comments for a post
  async getPostComments(postId: number): Promise<CommentResponse[]> {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return comments;
  },

  // Update a comment
  async updateComment(
    commentId: number,
    authorId: number,
    data: CommentUpdateInput
  ): Promise<CommentResponse> {
    // First check if the comment belongs to the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== authorId) {
      throw new Error("Not authorized to update this comment");
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return updatedComment;
  },

  // Delete a comment
  async deleteComment(commentId: number, authorId: number): Promise<void> {
    // First check if the comment belongs to the author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.authorId !== authorId) {
      throw new Error("Not authorized to delete this comment");
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  },
};
