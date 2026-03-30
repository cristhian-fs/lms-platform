import { Card, CardContent, CardFooter } from "@lms-platform/ui/components/card";
import { Skeleton } from "@lms-platform/ui/components/skeleton";

export function CourseCardSkeleton() {
  return (
    <Card className="rounded-xl">
      <Skeleton className="w-full h-44" />
      <CardContent className="flex flex-col gap-2 pt-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
      <CardFooter className="gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </CardFooter>
    </Card>
  );
}
