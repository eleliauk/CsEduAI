import {
  Book,
  Calendar,
  Users,
  Search,
  Sparkles,
  Brain,
  Cpu,
  Code,
  Layers,
  ChevronRight,
  Zap,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useStudentCourseStore } from "@/feature/course/student-store";
import { request } from "@/lib/request";

interface Course {
  id: number;
  title: string;
  description: string;
  cover: string;
  tag: string;
  created_at: number;
  updated_at: number;
  studied: boolean;
  studied_by: number;
  studied_duration: number;
}

function StudentCourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(10);

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { setCurrentCourse } = useStudentCourseStore();

  // 页面加载动画
  useEffect(() => {
    // 简单的延迟加载效果
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // 获取课程数据
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // 假设token存储在localStorage中

        if (!token) {
          console.error("未找到认证令牌");
          return;
        }

        const response = await fetch(
          `http://47.120.14.30:8083/api/v1/user/student/courses?page_index=${pageIndex}&page_size=${pageSize}`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.code === 200) {
          setCourses(data.data.courses);
          setTotalCourses(data.data.total);
        } else if (data.code === 401)
       {
          navigate({ to: "/login" });
        }   else{
          console.error("获取课程失败:", data.message);
        }
      } catch (error) {
        console.error("获取课程出错:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [pageIndex, pageSize]);

  // 获取所有课程分类
  const categories = Array.from(
    new Set(courses.map((course) => course.tag))
  ).filter(Boolean) as string[];

  const filteredCourses = courses.filter(
    (course) =>
      (selectedCategory === null || course.tag === selectedCategory) &&
      (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-b from-primary/[0.07] to-transparent dark:from-primary/[0.05]" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-70 dark:opacity-30" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl opacity-70 dark:opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* 页面头部 */}
        <header className="relative mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative bg-gradient-to-br from-primary/90 to-primary p-3 rounded-xl shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                AI教学助手
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  navigate({ to: "/welcome" });
                }}
                className="h-9 w-9 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 英雄区域 */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent mb-6 leading-tight transition-all duration-700 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
           唯思启联:AI赋能的普惠教育平台
            </h1>
            <p
              className={`text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto transition-all duration-700 delay-100 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
             以“技术赋能教育普惠”为核心，构建双向赋能的可持续生态，推动前沿技术下沉至校园真实场景。
            </p>

            {/* 搜索框 */}
            <div
              className={`relative max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="搜索课程名称、描述或教师..."
                className="pl-12 py-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 分类标签 */}
            <div
              className={`flex flex-wrap justify-center gap-2 mb-8 transition-all duration-700 delay-300 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="rounded-full"
              >
                全部课程
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </header>

        {/* 特色区域 */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 transition-all duration-700 delay-400 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="bg-primary/10 p-3 rounded-lg w-fit mb-4">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI辅助学习</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              智能分析学习进度，提供个性化学习建议和实时解答疑问
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="bg-blue-500/10 p-3 rounded-lg w-fit mb-4">
              <Cpu className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">实践项目</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              通过真实项目练习，巩固理论知识，培养实际开发能力
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="bg-indigo-500/10 p-3 rounded-lg w-fit mb-4">
              <Code className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">代码分析</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              智能代码审查和优化建议，帮助你编写更高质量的代码
            </p>
          </div>
        </div>

        {/* 课程列表标题 */}
        <div
          className={`flex items-center justify-between mb-8 transition-all duration-700 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">推荐课程</h2>
          </div>
          <Button variant="ghost" size="sm" className="gap-1">
            查看全部 <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* 课程列表 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              className={`group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
              style={{ transitionDelay: `${600 + index * 100}ms` }}
            >
              {/* 课程卡片顶部彩条 */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-indigo-500" />

              {/* 添加课程封面图片 */}
              <div className="w-full h-40 overflow-hidden">
                <img
                  src={course.cover}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-medium text-primary/80 mb-2 flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1"></span>
                      {course.tag}
                    </div>
                    <Link
                      to="/student/course/$courseId"
                      params={{ courseId: course.id.toString() }}
                      className="block group-hover:text-primary transition-colors duration-300"
                    >
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                        {course.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-lg">
                    {course.tag === "人工智能" ? (
                      <Brain className="w-5 h-5 text-primary" />
                    ) : course.tag === "前端开发" ? (
                      <Code className="w-5 h-5 text-blue-500" />
                    ) : course.tag === "后端开发" ? (
                      <Layers className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <Book className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {course.studied_by}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(course.created_at * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary flex items-center gap-1">
                    {course.tag}
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                  </div>
                </div>

                {/* 悬停时显示的按钮 */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                  <Button
                    className="gap-2 w-full"
                    onClick={() => {
                      navigate({
                        to: "/student/course/$courseId",
                        params: { courseId: course.id.toString() },
                      });
                      setCurrentCourse(course);
                      request.post(`/user/student/study/${course.id}`);
                    }}
                  >
                    进入学习 <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 加载状态显示 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div
            className={`text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-all duration-700 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          >
            <div className="flex justify-center mb-4">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-medium mb-2">没有找到匹配的课程</h3>
            <p className="text-gray-500 dark:text-gray-400">
              尝试使用不同的搜索词或清除筛选条件
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              清除筛选
            </Button>
          </div>
        )}

        {/* 分页控件 */}
        {!loading && totalCourses > pageSize && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      pageIndex > 1 &&
                      setPageIndex((prev) => Math.max(1, prev - 1))
                    }
                    className={
                      pageIndex === 1
                        ? "opacity-50 pointer-events-none"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: Math.min(5, Math.ceil(totalCourses / pageSize)) },
                  (_, i) => {
                    // 计算要显示的页码
                    let pageNum = pageIndex;
                    if (pageIndex <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pageIndex >=
                      Math.ceil(totalCourses / pageSize) - 2
                    ) {
                      pageNum = Math.ceil(totalCourses / pageSize) - 4 + i;
                    } else {
                      pageNum = pageIndex - 2 + i;
                    }

                    // 确保页码在有效范围内
                    if (
                      pageNum > 0 &&
                      pageNum <= Math.ceil(totalCourses / pageSize)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={pageIndex === pageNum}
                            onClick={() => setPageIndex(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  }
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      pageIndex < Math.ceil(totalCourses / pageSize) &&
                      setPageIndex((prev) =>
                        Math.min(Math.ceil(totalCourses / pageSize), prev + 1)
                      )
                    }
                    className={
                      pageIndex === Math.ceil(totalCourses / pageSize)
                        ? "opacity-50 pointer-events-none"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/student/course/")({
  component: StudentCourseList,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});
