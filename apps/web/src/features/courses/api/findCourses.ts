import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Course, UseQueryParams } from "../types";
import type { SuccessResponse } from "@/lib/request";

export const useFindCourses = (props?: UseQueryParams<SuccessResponse<Course[]>>) =>
  useQuery({
    ...props,
    queryKey: api.course.keys.all(),
    queryFn: () => api.course.findAll(),
  });
