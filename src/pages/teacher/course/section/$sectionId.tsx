import { Button } from "@/components/ui/button";
import "github-markdown-css";

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
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Timer,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { ExerciseDialog } from "@/feature/course/components/ExerciseDialog";
import { useCourseStore } from "../../../../feature/course/teacher-store";
import { request } from "@/lib/request";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Exercise {
  created_at: number;
  description: string;
  id: number;
  title: string;
  updated_at: number;
}

interface SectionDetail {
  content: string;
  created_at: number;
  id: number;
  title: string;
  updated_at: number;
}

function SectionDetail() {
  const { sectionId } = Route.useParams();
  const navigate = useNavigate();

  // 使用zustand store
  const { currentCourse, currentSection } = useCourseStore();

  // 本地状态管理章节详情
  const [sectionDetail, setSectionDetail] = useState<SectionDetail>({
    id: parseInt(sectionId),
    title: currentSection?.title || "加载中...",
    content: "",
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  // 单独管理练习数据
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // 章节描述（UI展示用）
  const [description, setDescription] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<
    Exercise | undefined
  >();

  // 加载章节详情
  useEffect(() => {
    // 如果store中没有当前课程或章节，则返回课程页面
    if (!currentCourse || !currentSection) {
      toast.error("章节信息不存在，请从课程页面进入");
      navigate({
        to: "/teacher/course/$courseId",
        params: { courseId: currentCourse?.id.toString() || "1" },
      });
      return;
    }

    // 加载章节详情
    const loadSectionDetail = async () => {
      try {
        // 调用API获取章节详情
        const res = await request.get(`/user/section/${sectionId}`);
        if (res.section) {
          setSectionDetail({
            id: parseInt(sectionId),
            title: res.section.title || currentSection.title,
            content: res.section.content || "",
            created_at: res.section.created_at || Date.now(),
            updated_at: res.section.updated_at || Date.now(),
          });

          // 设置描述
          setDescription(res.section.description || "");

          // 获取章节练习列表
          try {
            const exercisesRes = await request.get(
              `/user/exercises/${sectionId}`
            );

            const { exercises } = exercisesRes;
            setExercises(exercises ?? []);
          } catch (error) {
            console.error("获取练习列表失败:", error);
            toast.error("获取练习列表失败");
          }
        }
      } catch (error) {
        console.error("获取章节详情失败:", error);
        toast.error("获取章节详情失败");
      }
    };

    loadSectionDetail();
  }, [sectionId, currentCourse, currentSection, navigate]);

  const handleCreateExercise = async (data: {
    title: string;
    description: string;
  }) => {
    try {
      // 根据API接口要求构建请求数据
      const requestData = {
        title: data.title,
        description: data.description,
        section_id: parseInt(sectionId),
      };

      // 调用API创建练习
      await request.post(`/user/teacher/exercise`, requestData);
      const exercisesRes = await request.get(`/user/exercises/${sectionId}`);

      const { exercises } = exercisesRes;
      setExercises(exercises ?? []);
      toast.success("练习创建成功");
    } catch (error) {
      console.error("创建练习失败:", error);
      toast.error("创建练习失败");
    }
  };

  const handleEditExercise = async (data: {
    title: string;
    description: string;
  }) => {
    try {
      if (!editingExercise) return;

      // 根据API接口要求构建请求数据
      const requestData = {
        title: data.title,
        description: data.description,
      };

      // 调用API更新练习
      await request.put(
        `/user/teacher/exercise/${editingExercise.id}`,
        requestData
      );
      const exercisesRes = await request.get(`/user/exercises/${sectionId}`);

      const { exercises } = exercisesRes;
      setExercises(exercises ?? []);
    } catch (error) {
      console.error("更新练习失败:", error);
      toast.error("更新练习失败");
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    try {
      // 调用API删除练习
      const res = await request.delete(`/user/teacher/exercise/${exerciseId}`);

      if (res.success) {
        // 从练习列表中移除
        setExercises((prev) =>
          prev.filter((exercise) => exercise.id !== exerciseId)
        );
        toast.success("练习删除成功");
      }
    } catch (error) {
      console.error("删除练习失败:", error);
      toast.error("删除练习失败");
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
        <Link
          to="/teacher/course/$courseId"
          params={{ courseId: currentCourse?.id.toString() || "1" }}
          className="inline-flex items-center gap-2 text-muted-foreground/80 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          返回课程详情
        </Link>

        {/* 章节信息卡片 */}
        <div className="relative bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-8 mb-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/[0.02] rounded-full blur-3xl group-hover:bg-primary/[0.03] transition-colors" />

          <div className="relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                  <div className="relative bg-gradient-to-b from-primary/80 to-primary p-4 rounded-xl shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {sectionDetail.title}
                  </h1>
                  <p className="text-muted-foreground/80 mt-2 text-lg">
                    {description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="group/btn relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <span className="relative">编辑章节</span>
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/[0.02] text-muted-foreground/80">
                <CheckCircle2 className="w-4 h-4 text-primary/60" />
                {exercises.length} 个练习
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/[0.02] text-muted-foreground/80">
                <Timer className="w-4 h-4 text-primary/60" />
                预计学习时间：30分钟
              </div>
            </div>
          </div>
        </div>

        {/* 两栏布局：章节内容和练习列表并排显示 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 章节内容 - 占据2/3宽度 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-8 h-full">
              <h2 className="text-xl font-semibold mb-6">章节内容</h2>
              <div className="markdown-body prose prose-gray dark:prose-invert max-w-none overflow-y-auto max-h-[calc(100vh-300px)]">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sectionDetail.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* 练习列表 - 占据1/3宽度，固定在右侧 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">练习列表</h2>
                  <Button
                    onClick={() => {
                      setEditingExercise(undefined);
                      setDialogOpen(true);
                    }}
                    size="sm"
                    className="group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PlusCircle className="w-4 h-4 mr-2" />
                    <span className="relative">添加练习</span>
                    <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-400 animate-pulse" />
                  </Button>
                </div>
              </div>

              <div className="divide-y divide-gray-200/50 dark:divide-gray-800/50 overflow-y-auto max-h-[calc(100vh-300px)]">
                {exercises.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                      <PlusCircle className="w-8 h-8 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                      暂无练习
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                      点击"添加练习"按钮创建本章节的第一个练习题
                    </p>
                  </div>
                ) : (
                  exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/[0.02] text-primary font-medium border border-primary/10">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-base bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary-foreground/90 transition-all duration-300">
                              {exercise.title}
                            </h3>
                            {exercise.description && (
                              <p className="text-xs text-muted-foreground/80 line-clamp-1 max-w-[200px]">
                                {exercise.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/5 h-8 w-8"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingExercise(exercise);
                                setDialogOpen(true);
                              }}
                              className="hover:bg-primary/5"
                            >
                              编辑练习
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-primary/5">
                              查看答案
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleDeleteExercise(exercise.id)}
                            >
                              删除练习
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExerciseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={
          editingExercise
            ? {
                id: editingExercise.id.toString(),
                title: editingExercise.title,
                description: editingExercise.description,
              }
            : undefined
        }
        onSubmit={editingExercise ? handleEditExercise : handleCreateExercise}
      />
    </div>
  );
}

export const Route = createFileRoute("/teacher/course/section/$sectionId")({
  component: SectionDetail,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    if (role !== "teacher") {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});
