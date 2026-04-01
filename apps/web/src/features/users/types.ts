export type UserEnrollment = {
  id: string;
  status: "active" | "completed" | "dropped";
  progressPct: number;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string;
  enrollments: UserEnrollment[];
};
