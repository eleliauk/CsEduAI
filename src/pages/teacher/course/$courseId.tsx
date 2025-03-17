import { Button } from "@/components/ui/button";

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
  Users,
  Calendar,
  ArrowLeft,
  GraduationCap,
  ListOrdered,
  Sparkles,
  Clock,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { SectionDialog } from "@/feature/course/components/SectionDialog";
import { CourseDialog } from "@/feature/course/components/CourseDialog";
import { request } from "@/lib/request";
import { toast } from "sonner";
import { formatUnixTime } from "@/lib/utils";
import { useCourseStore } from "@/feature/course/teacher-store";
import type { CourseDetail, Section } from "@/feature/course/teacher-store";

// 定义 SectionDialog 需要的数据类型
interface SectionDialogData {
  content: string;
  course_id: number;
  duration: number;
  title: string;
  video_url: string;
}

function CourseDetail() {
  const { courseId } = Route.useParams();
  const navigate = useNavigate();
  const routerState = useRouterState();

  // 从路由state中获取课程数据
  const courseFromState = routerState.location.state
    ? ((routerState.location.state as any).courseData as
        | CourseDetail
        | undefined)
    : undefined;

  // 使用zustand store
  const {
    currentCourse,
    setCurrentCourse,
    sections,
    setSections,
    setCurrentSection,
    deleteSection: storeDeleteSection,
  } = useCourseStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | undefined>();

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<
    CourseDetail | undefined
  >();

  useEffect(() => {
    setSections([]);
    getSections();

    // 如果有从路由状态传来的课程数据，则更新store
    if (courseFromState) {
      setCurrentCourse(courseFromState);
    } else if (!currentCourse) {
      // 如果没有课程数据且store中也没有，则跳转回课程列表
      navigate({
        to: "/teacher/course",
        state: { editCourseId: courseId } as any,
      });
    }
  }, [courseId, courseFromState]);

  const getSections = async () => {
    try {
      const res = await request.get(`/user/sections/${courseId}`);
      const { sections: apiSections } = res;
      if (apiSections) {
        setSections(apiSections ?? []);
      }
    } catch (error) {
      console.error("获取章节列表失败:", error);
      toast.error("获取章节列表失败");
    }
  };

  const handleCreateSection = async (data: SectionDialogData) => {
    console.log(data);
    try {
      await request.post(`/user/teacher/section`, {
        ...data,
        course_id: parseInt(courseId),
        duration: Math.round(data.duration * 60),
      });
      getSections();
      toast.success("章节创建成功");
    } catch (error) {
      console.error("创建章节失败:", error);
      toast.error("创建章节失败");
    }
  };

  const handleEditSection = async (data: SectionDialogData) => {
    if (!editingSection) return;

    try {
      // 调用API更新章节
      await request.put(`/user/teacher/section/${editingSection.id}`, {
        ...data,
        course_id: parseInt(courseId),
        duration: Math.round(data.duration * 60),
      });
      getSections();
      toast.success("章节更新成功");
    } catch (error) {
      console.error("更新章节失败:", error);
      toast.error("更新章节失败");
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    try {
      // 调用API删除章节
      await request.delete(`/user/teacher/section/${sectionId}`);
      // 从store中删除
      storeDeleteSection(sectionId);
      getSections();
      toast.success("章节删除成功");
    } catch (error) {
      console.error("删除章节失败:", error);
      toast.error("删除章节失败");
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
        {/* 返回按钮 */}
        <div
          className="inline-flex items-center gap-2 text-muted-foreground/80 hover:text-primary transition-colors mb-8 group cursor-pointer"
          onClick={() => navigate({ to: "/teacher/course" })}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回课程列表
        </div>

        {/* 课程信息卡片 */}
        <div className="relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-8 mb-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl group-hover:bg-primary/[0.03] transition-colors" />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-b from-primary/80 to-primary p-4 rounded-xl shadow-lg">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {currentCourse?.title}
                  </h1>
                  <p className="text-muted-foreground/80 mt-2 text-lg">
                    {currentCourse?.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="group/btn relative overflow-hidden"
                onClick={() => {
                  setEditingCourse(currentCourse || undefined);
                  setCourseDialogOpen(true);
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <span className="relative">编辑课程</span>
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/[0.02] text-muted-foreground/80">
                <Calendar className="w-4 h-4 text-primary/60" />
                创建时间：
                {currentCourse
                  ? formatUnixTime(currentCourse.created_at, "YYYY-MM-DD")
                  : ""}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/[0.02] text-muted-foreground/80">
                <ListOrdered className="w-4 h-4 text-primary/60" />
                {sections.length} 个章节
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/[0.02] text-muted-foreground/80">
                <Users className="w-4 h-4 text-primary/60" />
                {currentCourse?.studied_by || 0} 名学生
              </div>
            </div>
          </div>
        </div>

        {/* 章节列表 */}
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">章节列表</h2>
              <Button
                onClick={() => {
                  setEditingSection(undefined);
                  setDialogOpen(true);
                }}
                size="lg"
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <PlusCircle className="w-4 h-4 mr-2" />
                <span className="relative">添加章节</span>
                <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-400 animate-pulse" />
              </Button>
            </div>
          </div>

          <div className="divide-y divide-gray-200/50 dark:divide-gray-800/50">
            {sections.map((section: Section, index: number) => (
              <div
                key={section.id}
                className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between p-6">
                  <div className="flex-1 min-w-0">
                    <div
                      className="block group-hover:translate-x-1 transition-transform cursor-pointer"
                      onClick={() => {
                        // 设置当前选中的章节
                        setCurrentSection(section);
                        navigate({
                          to: "/teacher/course/section/$sectionId",
                          params: { sectionId: section.id.toString() },
                        });
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/[0.02] text-primary font-medium border border-primary/10">
                          {index + 1}
                        </div>
                        <h3 className="font-medium text-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary-foreground/90 transition-all duration-300">
                          {section.title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 mt-2 pl-11 text-sm text-muted-foreground/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            总时长: {Math.round(section.duration / 60)} 分钟
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 pl-11 text-xs text-muted-foreground/60">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          <span>
                            创建于:{" "}
                            {formatUnixTime(section.created_at, "YYYY-MM-DD")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>
                            更新于:{" "}
                            {formatUnixTime(section.updated_at, "YYYY-MM-DD")}
                          </span>
                        </div>
                      </div>
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
                          setEditingSection(section);

                          setDialogOpen(true);
                        }}
                        className="hover:bg-primary/5"
                      >
                        编辑章节
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-primary/5">
                        复制链接
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        删除章节
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={
          editingSection
            ? {
                id: editingSection.id,
                title: editingSection.title,
                content: editingSection.content || "",
                duration: editingSection.duration,
                course_id: currentCourse?.id || 0,
                video_url: editingSection.video_url || "",
              }
            : undefined
        }
        onSubmit={editingSection ? handleEditSection : handleCreateSection}
      />

      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
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
        onSubmit={async (data) => {
          if (!currentCourse) return;

          try {
            await request.put(`/user/teacher/course/${currentCourse.id}`, data);
            // 更新store中的课程数据
            setCurrentCourse({
              ...currentCourse,
              ...data,
            });
            toast.success("更新成功");
          } catch (error) {
            console.error("更新课程失败:", error);
            toast.error("更新失败");
          }
        }}
      />
    </div>
  );
}

export const Route = createFileRoute("/teacher/course/$courseId")({
  component: CourseDetail,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    if (role !== "teacher") {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});
