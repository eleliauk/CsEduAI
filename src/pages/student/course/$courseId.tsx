import {
  ArrowLeft,
  Book,
  Calendar,
  //GraduationCap,
  ListOrdered,
  Users,
  Brain,
  Code,
  Layers,
  ChevronRight,
  Sparkles,
  PlayCircle,
  FileText,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useStudentCourseStore } from "@/feature/course/student-store";
import { request } from "@/lib/request";
import { formatUnixTime } from "@/lib/utils";

interface Section {
  id: number;
  title: string;
  studied_duration: number;
  duration: number;
  created_at: number;
  updated_at: number;
  description?: string;
  content?: string;
  order?: number;
  type?: "video" | "text" | "quiz";
  completed?: boolean;
}

function StudentCourseDetail() {
  const { courseId } = useParams({ from: "/student/course/$courseId" });
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentCourse, setCurrentSection } = useStudentCourseStore();
  const [sections, setSections] = useState<Section[]>([]);
  const navigate = useNavigate();

  // 获取章节列表
  const fetchSections = async () => {
    try {
      const response = await request.get(`/user/sections/${currentCourse?.id}`);
      if (response.sections) {
        setSections(response.sections);
      }
    } catch (error) {
      console.error("获取章节列表失败:", error);
    }
  };

  useEffect(() => {
    if (currentCourse && courseId && parseInt(courseId) === currentCourse.id) {
      fetchSections();
    } else {
      navigate({
        to: "/student/course",
      });
    }
  }, [courseId]);

  // 页面加载动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const courseDuration = sections.reduce(
    (acc, section) => acc + section.duration,
    0
  );

  const studiedDuration = sections.reduce(
    (acc, section) => acc + section.studied_duration,
    0
  );

  const studyProgress = Math.min(
    Math.round((studiedDuration / courseDuration) * 100),
    100
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-primary/[0.07] to-transparent dark:from-primary/[0.05]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-70 dark:opacity-30" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 返回按钮 */}
        <Link
          to="/student/course"
          className={`inline-flex items-center gap-2 text-gray-500 hover:text-primary  mb-8 transition-all duration-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回课程列表</span>
        </Link>

        {/* 课程头部 */}
        <div
          className={`relative mb-12 transition-all duration-700 delay-100 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/90 to-primary flex items-center justify-center shadow-lg">
                  {currentCourse?.tag === "前端开发" ? (
                    <Code className="w-10 h-10 text-white" />
                  ) : currentCourse?.tag === "后端开发" ? (
                    <Layers className="w-10 h-10 text-white" />
                  ) : currentCourse?.tag === "人工智能" ? (
                    <Brain className="w-10 h-10 text-white" />
                  ) : (
                    <Book className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -z-10 inset-0 bg-primary/20 blur-xl rounded-full"></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-medium text-primary/80 px-2 py-1 bg-primary/5 rounded-full">
                    {currentCourse?.tag}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    <Sparkles className="w-3 h-3" />
                    <span>热门课程</span>
                  </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                  {currentCourse?.title}
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-3xl">
                  {currentCourse?.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/70" />
                    <span>
                      {formatUnixTime(currentCourse?.created_at!, "YYYY-MM-DD")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary/70" />
                    <span>{currentCourse?.studied_by} 名学生</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary/70" />
                    <span>总时长 {courseDuration / 60 / 60} 小时</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        学习进度
                      </span>
                      <span className="font-medium text-primary">
                        {studyProgress}%
                      </span>
                    </div>
                    <Progress value={studyProgress} className="h-2" />
                  </div>
                  <div className="flex gap-3">
                    <Button className="gap-2">
                      <PlayCircle className="w-4 h-4" />
                      继续学习
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      课程资料
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 章节列表 */}
        <div
          className={`mb-12 transition-all duration-700 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-primary" />
              课程章节
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              共 {sections.length} 个章节
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <div className="absolute top-0 left-0 h-full w-1 bg-primary/20 group-hover:bg-primary/50 transition-colors" />

                <div className="p-5">
                  <Link
                    to="/student/course/section/$sectionId"
                    params={{ sectionId: section.id.toString() }}
                    className="block"
                    onClick={() => {
                      setCurrentSection(section);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
                            {section.title}
                          </h3>
                          {section.completed && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              已完成
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">
                          {section.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                          {section.type === "video" ? (
                            <PlayCircle className="w-4 h-4 text-primary/70" />
                          ) : (
                            <FileText className="w-4 h-4 text-primary/70" />
                          )}
                          <span>{section.duration / 60} 分钟</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/student/course/$courseId")({
  component: StudentCourseDetail,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});
