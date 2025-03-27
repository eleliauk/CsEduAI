import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudentCourseStore } from "@/feature/course/student-store";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  FileText,
  RefreshCcw,
  Save,
  Send,
  CheckCircle,
  Terminal,
  ChevronDown,
  ChevronRight,
  History,
  Clock,
  Bot,
  GraduationCap,
  Loader2,
  AlertTriangle,
  XCircle,
  Award,
  Star,
  Play,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeEditor from "@/feature/course/components/code-editor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { request, fetchSSE } from "@/lib/request";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Allotment, LayoutPriority } from "allotment";
import "allotment/dist/style.css";
// 导入自定义拖拽区域样式
import "@/feature/course/allotment-custom.css";

export const Route = createFileRoute("/student/course/section/exercise")({
  component: ExerciseDetail,
});

import { sqlService, SQLResult } from "@/feature/course/sql-service";
import { SQLResults } from "@/feature/course/components/sql-results";

// 添加历史记录类型定义
interface SubmissionHistory {
  id: number;
  created_at: number;
  updated_at: number;
  user_id: number;
  exercise_id: number;
  answer: string;
}

// AI提示消息类型
interface AiMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: number;
  thinking?: string;
}

// 根据分数获取对应的图标和颜色
const getScoreInfo = (score: number) => {
  if (score >= 90) {
    return {
      icon: <Award className="w-4 h-4 text-green-500" />,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
    };
  } else if (score >= 70) {
    return {
      icon: <Star className="w-4 h-4 text-blue-500" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    };
  } else if (score >= 60) {
    return {
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
    };
  } else {
    return {
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
    };
  }
};

function ExerciseDetail() {
  const { currentSection, currentExercise, exercises, setCurrentExercise } =
    useStudentCourseStore();
  const [code, setCode] = useState("");
  const [currentEditingCode, setCurrentEditingCode] = useState("");
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "sql">("javascript");
  const [submissionHistory, setSubmissionHistory] = useState<
    SubmissionHistory[]
  >([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null
  );
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [thinking, setThinking] = useState("");
  const [tipInfo, setTipInfo] = useState<{ totalTime?: number }>({});

  // 评分数据
  const [reviewScores, setReviewScores] = useState<{
    codeStandard: number;
    efficiency: number;
    completion: number;
    comments?: string;
  }>({
    codeStandard: 0,
    efficiency: 0,
    completion: 0,
  });

  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [sqlResults, setSqlResults] = useState<SQLResult[]>();
  const [sqlError, setSqlError] = useState<string>();

  // 获取答题历史记录
  const fetchSubmissionHistory = async () => {
    if (!currentExercise) return;

    try {
      const res = await request.get(
        `/user/student/exercises?exercise_id=${currentExercise.id}`
      );

      const { exercises } = res;
      setSubmissionHistory(exercises ?? []);
    } catch (error) {
      console.error("获取答题历史失败:", error);
    }
  };

  // 在组件加载和exercise变化时获取历史记录
  useEffect(() => {
    fetchSubmissionHistory();
  }, [currentExercise?.id]);

  // 同步code到currentEditingCode
  useEffect(() => {
    if (selectedHistoryId === null) {
      setCurrentEditingCode(code);
    }
  }, [code, selectedHistoryId]);

  if (!currentExercise || !currentSection) {
    return <div>练习不存在</div>;
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await request.post(`/user/student/exercise`, {
        answer: code,
        exercise_id: currentExercise.id,
      });
      toast.success("提交成功");
      fetchSubmissionHistory();
    } catch (error) {
      toast.error("提交失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 查看历史记录代码
  const handleViewHistory = (submission: SubmissionHistory) => {
    if (selectedHistoryId === null) {
      setCurrentEditingCode(code);
    }
    setSelectedHistoryId(submission.id);
    setCode(submission.answer);
    setLanguage(submission.answer.includes("python") ? "python" : "javascript");
  };

  // 恢复到当前代码
  const handleRestoreCurrent = () => {
    setSelectedHistoryId(null);
    setCode(currentEditingCode);
  };

  // AI 内容生成函数
  const generateAIContent = async (prompt: string) => {
    if (!currentExercise) return "";

    setIsAiLoading(true);
    setAiContent(""); // 清空内容
    setThinking(""); // 清空思考过程
    setTipInfo({}); // 清空提示信息

    let finalContent = "";
    let thinkingContent = "";

    // 创建一个临时的AI消息，用于显示思考过程和内容
    const tempAiMessage: AiMessage = {
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      thinking: "", // 添加思考过程字段
    };

    // 添加临时消息到列表
    setMessages((prev) => [...prev, tempAiMessage]);

    try {
      await fetchSSE("/user/chat", {
        body: {
          content: prompt,
          memorized: true,
        },
        onMessage: (text: string) => {
          try {
            const jsonData = JSON.parse(text);

            if (jsonData.message) {
              if (jsonData.type === "think") {
                thinkingContent += jsonData.message;
                setThinking(thinkingContent);

                // 更新临时消息的思考过程
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === "assistant") {
                    lastMessage.thinking = thinkingContent;
                  }
                  return newMessages;
                });

                // 滚动到最新内容
                setTimeout(() => {
                  if (dialogContentRef.current) {
                    dialogContentRef.current.scrollTop =
                      dialogContentRef.current.scrollHeight;
                  }
                }, 0);
              } else if (jsonData.type === "content") {
                finalContent += jsonData.message;
                setAiContent(finalContent);

                // 更新临时消息的内容
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === "assistant") {
                    lastMessage.content = finalContent;
                  }
                  return newMessages;
                });

                // 滚动到最新内容
                setTimeout(() => {
                  if (dialogContentRef.current) {
                    dialogContentRef.current.scrollTop =
                      dialogContentRef.current.scrollHeight;
                  }
                }, 0);
              } else if (jsonData.type === "tip") {
                try {
                  const tipData = JSON.parse(jsonData.message);
                  setTipInfo((prev) => ({
                    ...prev,
                    totalTime: tipData.total_time,
                  }));
                } catch (e) {
                  console.error("解析tip数据失败:", e);
                }
              }
            }
          } catch (e) {
            console.error("解析JSON数据失败:", e, "原始文本:", text);
          }
        },
        onError: (error: Error) => {
          console.error("AI 内容生成失败:", error);
          setAiContent("内容生成失败，请稍后重试");
          setIsAiLoading(false);

          // 更新临时消息为错误消息
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content = "内容生成失败，请稍后重试";
            }
            return newMessages;
          });
        },
      });

      // 流式生成完成后
      setIsAiLoading(false);

      return finalContent;
    } catch (error) {
      console.error("AI 内容生成失败:", error);
      setAiContent("内容生成失败，请稍后重试");
      setIsAiLoading(false);

      // 更新临时消息为错误消息
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content = "内容生成失败，请稍后重试";
        }
        return newMessages;
      });

      return "内容生成失败，请稍后重试";
    }
  };

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage: AiMessage = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    // 添加用户消息到列表
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    // 滚动到底部
    setTimeout(() => {
      if (dialogContentRef.current) {
        dialogContentRef.current.scrollTop =
          dialogContentRef.current.scrollHeight;
      }
    }, 0);

    // 生成AI回复
    await generateAIContent(prompt);
  };

  // 重新生成评价
  const handleRegenerateReview = async () => {
    if (!code || submissionHistory.length === 0) {
      toast.error("没有可评价的代码");
      return;
    }

    setIsGeneratingReview(true);
    toast.success("正在生成评价");

    // 构建评价 prompt
    const reviewPrompt = `
你是一名资深编程专家工程师，请对以下代码进行专业、详细的评价，并严格按照指定格式返回评分和评语：

题目描述：
${currentExercise.description}

学生提交的代码：
\`\`\`${language}
${code}
\`\`\`

请从以下维度进行评价：

1. 代码规范（0-100）：代码结构是否清晰、命名是否规范、注释是否完整、代码易读性如何。
2. 执行效率（0-100）：代码运行效率如何、算法复杂度是否合理、资源占用是否优化。
3. 完成度（0-100）：功能实现是否完整、是否符合题目要求、边界情况处理是否完善。

请按照以下JSON格式返回评价结果：
{
  "codeStandard": 评分（0-100的整数，代码规范评分）, 
  "efficiency": 评分（0-100的整数，执行效率评分）, 
  "completion": 评分（0-100的整数，完成度评分）, 
  "comments": "详细评语，需具体指出代码的优点和明确的改进建议"
}

请确保返回的是有效的JSON格式，不要添加其他文本。
`;

    try {
      let responseText = "";

      await fetchSSE("/user/chat", {
        body: {
          content: reviewPrompt,
          memorized: false,
        },
        onMessage: (text: string) => {
          try {
            const jsonData = JSON.parse(text);

            if (jsonData.message && jsonData.type === "content") {
              responseText += jsonData.message;
            }
          } catch (e) {
            console.error("解析JSON数据失败:", e, "原始文本:", text);
          }
        },
        onError: (error: Error) => {
          console.error("AI 评价生成失败:", error);
          toast.error("评价生成失败，请稍后重试");
          setIsGeneratingReview(false);
        },
      });

      // 尝试从返回的文本中提取JSON
      try {
        // 查找JSON对象的开始和结束位置
        const jsonStartIndex = responseText.indexOf("{");
        const jsonEndIndex = responseText.lastIndexOf("}") + 1;

        if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
          const jsonStr = responseText.substring(jsonStartIndex, jsonEndIndex);
          const reviewData = JSON.parse(jsonStr);

          // 更新评分数据
          setReviewScores({
            codeStandard: parseInt(reviewData.codeStandard) || 0,
            efficiency: parseInt(reviewData.efficiency) || 0,
            completion: parseInt(reviewData.completion) || 0,
            comments: reviewData.comments || "",
          });

          toast.success("评价生成成功");
        } else {
          throw new Error("未找到有效的JSON数据");
        }
      } catch (error) {
        console.error("解析评价数据失败:", error, "原始响应:", responseText);
        toast.error("评价数据解析失败，请重试");
      }
    } catch (error) {
      console.error("生成评价失败:", error);
      toast.error("评价生成失败，请稍后重试");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="container h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/student/course/section/$sectionId"
              params={{ sectionId: currentSection.id.toString() }}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回章节</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentExercise.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Terminal className="w-4 h-4" />
                  {language}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("javascript")}>
                  JavaScript
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("python")}>
                  Python
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("java")}>
                  Java
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("sql")}>
                  SQL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {language === "sql" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsExecutingSql(true);
                  setSqlError(undefined);
                  try {
                    const response = await sqlService.execute(code);
                    if (response.success && response.data) {
                      setSqlResults(response.data);
                    } else {
                      setSqlError(response.error);
                    }
                  } catch (error) {
                    setSqlError(error instanceof Error ? error.message : "执行失败");
                  } finally {
                    setIsExecutingSql(false);
                  }
                }}
                disabled={isExecutingSql || !code.trim()}
              >
                {isExecutingSql ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => {}}>
                <Save className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleSubmit}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  提交题目
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="pt-16 flex h-[calc(100vh)]">
        {/* 左侧题目列表 */}
        <div className="w-[280px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              练习列表
            </h3>
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => {
                    setCurrentExercise(exercise);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentExercise.id === exercise.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{exercise.title}</span>
                    {currentExercise.id === exercise.id && (
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 中间题目说明和代码编辑区域 */}
        <div className="flex-1 flex flex-col">
          <div className="flex h-full">
            <Allotment>
              <Allotment.Pane minSize={300}>
                {/* 左侧题目说明 */}
                <div className="w-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
                  <div className="p-6">
                    <Tabs defaultValue="description">
                      <TabsList className="w-full grid grid-cols-4">
                        <TabsTrigger
                          value="description"
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          题目描述
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="flex items-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          提交历史
                        </TabsTrigger>
                        <TabsTrigger
                          value="review"
                          className="flex items-center gap-2"
                        >
                          <GraduationCap className="w-4 h-4" />
                          批改评价
                        </TabsTrigger>
                        <TabsTrigger
                          value="ai"
                          className="flex items-center gap-2"
                        >
                          <Bot className="w-4 h-4" />
                          AI 助手
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="description" className="mt-6">
                        <div className="markdown-body prose dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentExercise.description}
                          </ReactMarkdown>
                        </div>
                      </TabsContent>
                      <TabsContent value="history" className="mt-6">
                        <div className="flex flex-col h-[calc(100vh-12rem)]">
                          <div className="space-y-3 h-full">
                            {submissionHistory.length > 0 ? (
                              submissionHistory.map((submission, index) => (
                                <div
                                  key={submission.id}
                                  className={`p-3 rounded-lg border ${
                                    selectedHistoryId === submission.id
                                      ? "border-primary bg-primary/5"
                                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                  } cursor-pointer transition-colors`}
                                  onClick={() => handleViewHistory(submission)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-gray-500" />
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        提交记录 #{index + 1}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(
                                        submission.created_at * 1000
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  暂无提交记录
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="review" className="mt-6">
                        <div className="flex flex-col h-[calc(100vh-12rem)]">
                          {submissionHistory.length > 0 ? (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                                    已提交
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  最后提交于{" "}
                                  {new Date(
                                    submissionHistory[0].created_at * 1000
                                  ).toLocaleString()}
                                </div>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    得分评价
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      AI 评价
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-xs"
                                      onClick={handleRegenerateReview}
                                      disabled={isGeneratingReview}
                                    >
                                      <RefreshCcw
                                        className={`w-3 h-3 mr-1 ${isGeneratingReview ? "animate-spin" : ""}`}
                                      />
                                      {isGeneratingReview
                                        ? "生成中..."
                                        : "重新生成"}
                                    </Button>
                                  </div>
                                </div>
                                {isGeneratingReview ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        代码规范
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`flex items-center gap-1 px-2 py-1 rounded-full ${getScoreInfo(reviewScores.codeStandard).bgColor} ${getScoreInfo(reviewScores.codeStandard).borderColor} border`}
                                        >
                                          {
                                            getScoreInfo(
                                              reviewScores.codeStandard
                                            ).icon
                                          }
                                          <span
                                            className={`text-sm font-medium ${getScoreInfo(reviewScores.codeStandard).color}`}
                                          >
                                            {reviewScores.codeStandard}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            /100
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        执行效率
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`flex items-center gap-1 px-2 py-1 rounded-full ${getScoreInfo(reviewScores.efficiency).bgColor} ${getScoreInfo(reviewScores.efficiency).borderColor} border`}
                                        >
                                          {
                                            getScoreInfo(
                                              reviewScores.efficiency
                                            ).icon
                                          }
                                          <span
                                            className={`text-sm font-medium ${getScoreInfo(reviewScores.efficiency).color}`}
                                          >
                                            {reviewScores.efficiency}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            /100
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        完成度
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`flex items-center gap-1 px-2 py-1 rounded-full ${getScoreInfo(reviewScores.completion).bgColor} ${getScoreInfo(reviewScores.completion).borderColor} border`}
                                        >
                                          {
                                            getScoreInfo(
                                              reviewScores.completion
                                            ).icon
                                          }
                                          <span
                                            className={`text-sm font-medium ${getScoreInfo(reviewScores.completion).color}`}
                                          >
                                            {reviewScores.completion}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            /100
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 总分显示 */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                          总体评价
                                        </span>
                                        {(() => {
                                          const avgScore = Math.round(
                                            (reviewScores.codeStandard +
                                              reviewScores.efficiency +
                                              reviewScores.completion) /
                                              3
                                          );
                                          const scoreInfo =
                                            getScoreInfo(avgScore);
                                          return (
                                            <div
                                              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${scoreInfo.bgColor} ${scoreInfo.borderColor} border`}
                                            >
                                              {scoreInfo.icon}
                                              <span
                                                className={`text-base font-bold ${scoreInfo.color}`}
                                              >
                                                {avgScore}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                /100
                                              </span>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    评价建议
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      AI 生成的建议
                                    </span>
                                  </div>
                                </div>
                                {isGeneratingReview ? (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="space-y-2">
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                    {(() => {
                                      const avgScore = Math.round(
                                        (reviewScores.codeStandard +
                                          reviewScores.efficiency +
                                          reviewScores.completion) /
                                          3
                                      );
                                      const scoreInfo = getScoreInfo(avgScore);

                                      return (
                                        <>
                                          {reviewScores.comments ? (
                                            <div className="space-y-4">
                                              <div
                                                className={`flex items-center gap-2 p-2 rounded-md ${scoreInfo.bgColor}`}
                                              >
                                                {scoreInfo.icon}
                                                <span
                                                  className={`text-sm font-medium ${scoreInfo.color}`}
                                                >
                                                  {avgScore >= 90
                                                    ? "优秀"
                                                    : avgScore >= 80
                                                      ? "良好"
                                                      : avgScore >= 60
                                                        ? "及格"
                                                        : "需要改进"}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                                {reviewScores.comments}
                                              </p>
                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                              暂无评语，请点击"重新生成"获取评价
                                            </p>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                              <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                提交后可查看批改评价
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                      <TabsContent value="ai" className="mt-6">
                        <div className="flex flex-col h-[calc(100vh-12rem)]">
                          <div
                            className="flex-1 overflow-y-auto space-y-6 mb-4"
                            ref={dialogContentRef}
                          >
                            {messages.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-center">
                                <Bot className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  有任何问题都可以问我
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                {messages.map((message, index) => (
                                  <div
                                    key={index}
                                    className={cn(
                                      "flex",
                                      message.role === "assistant"
                                        ? "justify-start"
                                        : "justify-end"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "max-w-[85%] rounded-lg p-3",
                                        message.role === "assistant"
                                          ? "bg-gray-100 dark:bg-gray-800"
                                          : "bg-primary text-white"
                                      )}
                                    >
                                      {message.thinking &&
                                        message.role === "assistant" && (
                                          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-2">
                                              <div className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                                              </div>
                                              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                思考过程
                                              </span>
                                            </div>
                                            <p className="text-sm text-blue-700 dark:text-blue-200 whitespace-pre-wrap">
                                              <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                              >
                                                {message.thinking}
                                              </ReactMarkdown>
                                            </p>
                                          </div>
                                        )}
                                      <div className="prose dark:prose-invert max-w-none text-sm">
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {message.content}
                                        </ReactMarkdown>
                                      </div>
                                      <p className="text-xs mt-2 opacity-60">
                                        {new Date(
                                          message.timestamp
                                        ).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {isAiLoading && (
                              <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto">
                            <div className="flex gap-2">
                              <textarea
                                className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="输入你的问题..."
                                rows={2}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                  }
                                }}
                              />
                              <Button
                                className="self-end"
                                onClick={handleSendMessage}
                                disabled={isAiLoading || !prompt.trim()}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </Allotment.Pane>
              <Allotment.Pane minSize={300}>
                {/* 代码编辑器和SQL结果 */}
                <div className="flex flex-col h-full overflow-hidden">
                  {selectedHistoryId && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                        <History className="w-4 h-4" />
                        <span>正在查看历史提交记录</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRestoreCurrent}
                      >
                        返回当前代码
                      </Button>
                    </div>
                  )}
                  {language === "sql" ? (
                    <Allotment vertical>
                      <Allotment.Pane>
                        <CodeEditor
                          value={code}
                          onChange={(value) => setCode(value || "")}
                          language="sql"
                          readOnly={false}
                        />
                      </Allotment.Pane>
                      <Allotment.Pane priority={LayoutPriority.Low}>
                        <div className="h-full overflow-auto border-t dark:border-gray-800">
                          <SQLResults
                            isLoading={isExecutingSql}
                            error={sqlError}
                            results={sqlResults}
                          />
                        </div>
                      </Allotment.Pane>
                    </Allotment>
                  ) : (
                    <CodeEditor
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      language={language}
                      readOnly={false}
                    />
                  )}
                </div>
              </Allotment.Pane>
            </Allotment>
          </div>
        </div>
      </div>
    </div>
  );
}
