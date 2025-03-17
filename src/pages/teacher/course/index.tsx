import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  MoreHorizontal,
  Book,
  Users,
  Calendar,
  Sparkles,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CourseDialog } from "@/feature/course/components/CourseDialog";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { request } from "@/lib/request";
import { formatUnixTime } from "@/lib/utils";
import { CourseDetail, useCourseStore } from "@/feature/course/teacher-store";

interface Course {
  id: number;
  cover: string;
  created_at: number;
  description: string;
  studied_by: number;
  tag: string;
  title: string;
  updated_at: number;
}

function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const navigate = useNavigate();
  const { setCurrentCourse } = useCourseStore();

  useEffect(() => {
    getCourses();
  }, []);

  const getCourses = async () => {
    const res = await request.get("/user/teacher/courses");
    const { courses } = res;
    setCourses(courses ?? []);
  };

  const handleCreateCourse = async (data: {
    title: string;
    description: string;
    cover: string;
    tag: string;
  }) => {
    try {
      await request.post("/user/teacher/course", data);
      getCourses();
    } catch (error) {
      console.error("创建课程失败:", error);
    }
  };

  const handleEditCourse = async (data: {
    title: string;
    description: string;
    cover: string;
    tag: string;
  }) => {
    if (!editingCourse) return;

    try {
      await request.put(`/user/teacher/course/${editingCourse.id}`, data);
      getCourses();
    } catch (error) {
      console.error("更新课程失败:", error);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await request.delete(`/user/teacher/courses/${courseId}`);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (error) {
      console.error("删除课程失败:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* 装饰元素 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/[0.03] to-transparent" />
      </div>

      <div className="container mx-auto py-12">
        {/* 页面头部 */}
        <div className="relative mb-12">
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-b from-primary/80 to-primary p-3 rounded-xl shadow-lg">
                    <Book className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    课程管理
                  </h1>
                  <p className="text-muted-foreground/80 mt-1">
                    管理和组织你的课程内容，创建优质的学习体验
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Button
                  onClick={() => {
                    setEditingCourse(undefined);
                    setDialogOpen(true);
                  }}
                  size="lg"
                  className="group relative overflow-hidden shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PlusCircle className="w-4 h-4 mr-2" />
                  创建课程
                  <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-400 animate-pulse" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 课程列表 */}
        <div className="grid gap-6">
          {courses.length === 0 ? (
            <div className="relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-dashed border-gray-200/50 dark:border-gray-800/50 p-12 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-50 rounded-xl" />
              <div className="relative">
                <Book className="w-12 h-12 mx-auto text-primary/40 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  暂无课程
                </h3>
                <p className="text-muted-foreground/80 mb-6">
                  点击右上角的"创建课程"按钮开始创建你的第一个课程
                </p>
                <Button
                  onClick={() => {
                    setEditingCourse(undefined);
                    setDialogOpen(true);
                  }}
                  size="lg"
                  className="group relative overflow-hidden shadow-lg hover:shadow-primary/25 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PlusCircle className="w-4 h-4 mr-2" />
                  创建课程
                  <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-400 animate-pulse" />
                </Button>
              </div>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="group relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-6 hover:shadow-[0_0_1rem_-0.25rem] hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <div className="relative flex items-start gap-6">
                  <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-gray-800">
                    {course.cover ? (
                      <img
                        src={course.cover}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="block group-hover:translate-x-1 transition-transform duration-300 cursor-pointer"
                      onClick={() => {
                        // 使用navigate跳转到课程详情页，并通过state传递课程数据
                        navigate({
                          to: "/teacher/course/$courseId",
                          params: { courseId: course.id.toString() },
                          state: { courseData: course } as any,
                        });
                        setCurrentCourse(course as CourseDetail);
                      }}
                    >
                      <h2 className="text-xl font-semibold truncate bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary-foreground/90 transition-all duration-300">
                        {course.title}
                      </h2>
                    </div>
                    <p className="mt-2 text-muted-foreground/80 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        {formatUnixTime(course.created_at, "YYYY-MM-DD")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary/60" />
                        {course.studied_by} 名学生
                      </div>
                      {course.tag && (
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-primary/60" />
                          {course.tag}
                        </div>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/5"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingCourse(course);
                          setDialogOpen(true);
                        }}
                        className="hover:bg-primary/5"
                      >
                        编辑课程
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-primary/5">
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        删除课程
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={
          editingCourse
            ? {
                id: editingCourse.id.toString(),
                title: editingCourse.title,
                description: editingCourse.description,
                cover: editingCourse.cover,
                tag: editingCourse.tag,
              }
            : undefined
        }
        onSubmit={editingCourse ? handleEditCourse : handleCreateCourse}
      />
    </div>
  );
}

export const Route = createFileRoute("/teacher/course/")({
  component: CourseList,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    if (role !== "teacher") {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});
