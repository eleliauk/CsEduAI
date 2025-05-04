import {
  ChevronRight,
  Code,
  GraduationCap,
  Layout,
  ListOrdered,
  ArrowLeft,
  Star,
  Clock,
  BookOpenCheck,
  Sparkles,
  Share2,
  Brain,
  List,
  FileText,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { useStudentCourseStore } from "@/feature/course/student-store";
import { request, fetchSSE } from "@/lib/request";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, formatUnixTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Section } from "@/feature/course/student-store";
import { AIAnalysisDialog } from "@/components/common/ai-analysis-dialog";
import { motion } from "motion/react";

interface Exercise {
  created_at: number;
  description: string;
  id: number;
  title: string;
  updated_at: number;
}

type DialogType = "summary" | "hint" | "outline" | null;

function StudentSectionDetail() {
  const { sectionId } = useParams({
    from: "/student/course/section/$sectionId",
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    currentCourse,
    currentSection,
    setCurrentSection,
    setCurrentExercise,
    setExercises: setStudentExercises,
  } = useStudentCourseStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState<"content" | "exercises">(
    "content"
  );
  const [openDialog, setOpenDialog] = useState<DialogType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiContent, setAiContent] = useState("");
  const [tipInfo, setTipInfo] = useState<{ totalTime?: number }>({});
  const [studyTime, setStudyTime] = useState(0); // 当前学习时长（秒）
  const studyTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // 添加右键菜单相关状态
  const [selectedText, setSelectedText] = useState("");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiDialogTitle, setAiDialogTitle] = useState("");
  const [aiDialogContent, setAiDialogContent] = useState("");
  const [aiDialogLoading, setAiDialogLoading] = useState(false);
  const [aiDialogType, setAiDialogType] = useState<
    "question" | "features" | "custom"
  >("question");
  const [aiDialogCopied, setAiDialogCopied] = useState(false);

  // 添加AI功能对话框相关状态
  const [aiFeatureDialogCopied, setAiFeatureDialogCopied] = useState(false);
  const [aiFeatureThinking, setAiFeatureThinking] = useState("");

  const getSection = async () => {
    try {
      const res = await request.get(`/user/section/${sectionId}`);
      const { section } = res;
      setCurrentSection({ ...currentSection, ...section });
    } catch (error) {
      console.error("获取章节详情失败:", error);
    }
  };

  const getExercises = async () => {
    try {
      const res = await request.get(`/user/exercises/${sectionId}`);
      const { exercises } = res;
      setExercises(exercises ?? []);
      setStudentExercises(exercises ?? []);
    } catch (error) {
      console.error("获取练习失败:", error);
    }
  };

  useEffect(() => {
    if (sectionId) {
      getSection();
      getExercises();
    }
  }, [sectionId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // AI 内容生成函数
  const generateAIContent = async (type: DialogType) => {
    if (!currentSection) return;

    setIsLoading(true);
    setAiContent(""); // 清空内容
    setAiFeatureThinking(""); // 清空思考过程
    setTipInfo({}); // 清空提示信息

    try {
      let prompt = "";
      switch (type) {
        case "summary":
          prompt = `你现在是一位经验丰富的教育学者和内容专家，需要对以下学习内容进行专业、准确的重点总结。请保持客观、严谨的学术语气，避免过度简化或遗漏关键信息。

请对以下内容进行重点总结：
1. 提取核心知识点和关键概念，按重要性排序
2. 用简洁明了的语言概括每个要点
3. 突出内容之间的逻辑关系和连接
4. 如有公式或特殊术语，请特别标注并解释
5. 总结篇幅控制在原文的20%以内，确保精炼且全面
6. 使用学术性语言，保持内容的准确性和权威性

内容如下：
${currentSection.content}`;
          break;
        case "hint":
          prompt = `你现在是一位专业的学科教师和辅导专家，需要为学生提供针对性的练习指导。请使用清晰、系统的教学语言，并确保所有建议都基于教学理论和实践经验。

请针对以下内容，给出练习提示和解题思路：
1. 分析内容中可能出现的典型题型和考点
2. 提供3-5个解题技巧和方法论，并解释其适用条件
3. 对难点部分给出详细的思路引导，循序渐进
4. 列举1-2个相关的例题及其解题步骤，确保步骤完整且逻辑清晰
5. 提供自测问题，帮助巩固知识点，并附带简要答案提示
6. 指出常见的错误和误区，并说明如何避免
7. 使用教师的专业语气，既有指导性又有鼓励性

内容如下：
${currentSection.content}`;
          break;
        case "outline":
          prompt = `你现在是一位课程设计专家和学习规划师，需要为学习者创建系统化的学习大纲。请使用结构化的教学设计语言，确保大纲逻辑严密且具有实用指导价值。

请为以下内容生成一个详细的学习大纲：
1. 创建多级结构的知识框架，使用标题和子标题，确保层次分明
2. 按照逻辑顺序组织知识点，从基础到进阶，体现渐进学习原则
3. 为每个主要部分添加简短的说明和具体可衡量的学习目标
4. 标注重点和难点内容，并提供攻克建议
5. 在适当位置添加复习建议和学习时间估计，符合认知科学原理
6. 如有实践内容，请单独列出实践任务和要点，强调应用能力培养
7. 使用教学设计专家的语气，保持专业、系统和指导性

内容如下：
${currentSection.content}`;
          break;
      }

      await fetchSSE("/user/chat", {
        body: {
          content: prompt,
          memorized: false,
        },
        onMessage: (text) => {
          try {
            const jsonData = JSON.parse(text);
            setIsLoading(false);

            if (jsonData.message) {
              if (jsonData.type === "think" || jsonData.type === "thinking") {
                setAiFeatureThinking((prev) => {
                  const newValue = prev + jsonData.message;
                  return newValue;
                });
              } else if (jsonData.type === "content") {
                setAiContent((prev) => {
                  const newValue = prev + jsonData.message;
                  return newValue;
                });
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
        onError: (error) => {
          console.error("AI 内容生成失败:", error);
          setAiContent("内容生成失败，请稍后重试");
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("AI 内容生成失败:", error);
      setAiContent("内容生成失败，请稍后重试");
      setIsLoading(false);
    }
  };

  // 对话框标题映射
  const dialogTitles: Record<NonNullable<DialogType>, string> = {
    summary: "重点总结",
    hint: "练习提示",
    outline: "学习大纲",
  };

  // 处理对话框打开
  const handleDialogOpen = (type: DialogType) => {
    setOpenDialog(type);
    generateAIContent(type);
  };

  // 处理复制内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(aiContent);
      setAiFeatureDialogCopied(true);
      setTimeout(() => setAiFeatureDialogCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 处理重新生成
  const handleRegenerate = async () => {
    setAiContent("");
    setAiFeatureThinking("");
    await generateAIContent(openDialog);
  };

  // 开始计时
  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = window.setInterval(() => {
      studyTimeRef.current += 1;
      setStudyTime((prev) => prev + 1);
    }, 1000);
  };

  // 停止计时
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 同步学习时长到后端
  const syncStudyTime = async () => {
    if (studyTimeRef.current === 0 || !currentSection?.id || !currentCourse?.id)
      return;

    try {
      await request.put(`/user/student/study`, {
        duration: studyTimeRef.current,
        section_id: currentSection.id,
        course_id: currentCourse.id,
      });

      const { latestCurrentSection } = await request.get(
        `/user/section/${currentSection.id}`
      );

      // 更新本地状态
      if (latestCurrentSection) {
        const updatedSection: Section = {
          ...latestCurrentSection,
          studied_duration:
            latestCurrentSection.studied_duration + studyTimeRef.current,
        };
        setCurrentSection(updatedSection);
      }

      // 重置计时器
      studyTimeRef.current = 0;
      setStudyTime(0);
    } catch (error) {
      console.error("同步学习时长失败:", error);
    }
  };

  // 页面可见性变化处理
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
        syncStudyTime();
      } else {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 定期同步学习时长（每1分钟）
  useEffect(() => {
    const syncInterval = setInterval(syncStudyTime, 1 * 60 * 1000);
    return () => clearInterval(syncInterval);
  }, []);

  // 组件挂载时开始计时，卸载时同步时长
  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
      syncStudyTime();
    };
  }, []);

  // 处理右键菜单
  const handleContextMenu = useCallback((e: MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (selectedText) {
      e.preventDefault();
      setSelectedText(selectedText);
      setContextMenuPosition({ top: e.clientY, left: e.clientX });
      setShowContextMenu(true);
    }
  }, []);

  // 处理点击事件，隐藏右键菜单
  const handleClick = useCallback(() => {
    setShowContextMenu(false);
  }, []);

  // 添加右键菜单事件监听
  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
    };
  }, [handleContextMenu, handleClick]);

  // 处理向AI提问
  const handleAskAI = () => {
    setShowContextMenu(false);
    setAiDialogTitle("AI 解答");
    setAiDialogContent("");
    setAiFeatureThinking("");
    setTipInfo({});
    setAiDialogLoading(false);
    setAiDialogType("question");
    setShowAIDialog(true);
  };

  // 处理用户提问
  const handleUserQuestion = (question: string) => {
    // 清空之前的内容
    setAiDialogContent("");
    setAiFeatureThinking("");
    setTipInfo({});
    setAiDialogLoading(true);

    // 记录开始时间
    const startTime = Date.now();
    let isCompleted = false;

    // 实际的AI接口调用
    const prompt = `你是一位专业的AI助手，请基于以下选中的文本内容，回答用户的问题。
    
选中的文本内容：
"""
${selectedText}
"""

用户的问题是：
"""
${question}
"""

请提供专业、准确、有帮助的回答。`;

    fetchSSE("/user/chat", {
      body: {
        content: prompt,
        memorized: false,
      },
      onMessage: (text) => {
        try {
          const jsonData = JSON.parse(text);
          setAiDialogLoading(false);

          if (jsonData.message) {
            if (jsonData.type === "thinking" || jsonData.type === "think") {
              setAiFeatureThinking((prev) => prev + jsonData.message);
            } else if (jsonData.type === "content") {
              setAiDialogContent((prev) => prev + jsonData.message);
            } else if (jsonData.type === "done" && !isCompleted) {
              // 计算生成时间
              isCompleted = true;
              const endTime = Date.now();
              const totalTime = (endTime - startTime) / 1000; // 转换为秒
              setTipInfo({ totalTime });
            }
          }
        } catch (e) {
          console.error("解析JSON数据失败:", e, "原始文本:", text);
        }
      },
      onError: (error) => {
        console.error("AI 内容生成失败:", error);
        setAiDialogContent("内容生成失败，请稍后重试");
        setAiDialogLoading(false);
      },
    });
  };

  // 处理重新生成AI内容
  const handleRegenerateAIContent = () => {
    // 清空之前的内容
    setAiDialogContent("");
    setAiFeatureThinking("");
    setTipInfo({});
    setAiDialogLoading(true);

    // 记录开始时间
    const startTime = Date.now();
    let isCompleted = false;

    // 根据不同的对话框类型生成不同的提示词
    let prompt = "";

    if (aiDialogType === "question") {
      // 如果是问答类型，不应该在这里重新生成
      setAiDialogLoading(false);
      return;
    } else if (aiDialogType === "features") {
      prompt = `你是一位专业的技术分析师和功能规划专家，请基于以下选中的文本内容，分析并列出其中涉及的技术点和功能点。
      
选中的文本内容：
"""
${selectedText}
"""

请按照以下格式提供分析：

## 技术和功能点分析

### 主要技术点
1. [技术点1]：简要说明
2. [技术点2]：简要说明
...

### 主要功能点
1. [功能点1]：简要说明
2. [功能点2]：简要说明
...

### 实现建议
- 提供1-2条关于如何实现或优化的建议

请确保分析全面、专业且有实用价值。`;
    } else {
      // 默认提示词
      prompt = `你是一位专业的AI助手，请基于以下选中的文本内容，提供专业、准确的解答。
      
选中的文本内容：
"""
${selectedText}
"""

请分析上述内容，并提供专业的见解和解释。`;
    }

    // 实际的AI接口调用
    fetchSSE("/user/chat", {
      body: {
        content: prompt,
        memorized: false,
      },
      onMessage: (text) => {
        try {
          const jsonData = JSON.parse(text);
          setAiDialogLoading(false);

          if (jsonData.message) {
            if (jsonData.type === "thinking" || jsonData.type === "think") {
              setAiFeatureThinking((prev) => prev + jsonData.message);
            } else if (jsonData.type === "content") {
              setAiDialogContent((prev) => prev + jsonData.message);
            } else if (jsonData.type === "done" && !isCompleted) {
              // 计算生成时间
              isCompleted = true;
              const endTime = Date.now();
              const totalTime = (endTime - startTime) / 1000; // 转换为秒
              setTipInfo({ totalTime });
            }
          }
        } catch (e) {
          console.error("解析JSON数据失败:", e, "原始文本:", text);
        }
      },
      onError: (error) => {
        console.error("AI 内容生成失败:", error);
        setAiDialogContent("内容生成失败，请稍后重试");
        setAiDialogLoading(false);
      },
    });
  };

  // 处理列出技术和功能点
  const handleListFeatures = () => {
    setShowContextMenu(false);
    setAiDialogTitle("技术和功能点分析");
    setAiDialogContent("");
    setAiDialogLoading(true);
    setAiDialogType("features");
    setShowAIDialog(true);

    // 清空之前的思考内容
    setAiFeatureThinking("");

    // 记录开始时间
    const startTime = Date.now();
    let thinking = "";
    let isCompleted = false;

    // 实际的AI接口调用
    const prompt = `你是一位专业的技术分析师和功能规划专家，请基于以下选中的文本内容，分析并列出其中涉及的技术点和功能点。
    
选中的文本内容：
"""
${selectedText}
"""

请按照以下格式提供分析：

## 技术和功能点分析

### 主要技术点
1. [技术点1]：简要说明
2. [技术点2]：简要说明
...

### 主要功能点
1. [功能点1]：简要说明
2. [功能点2]：简要说明
...

### 实现建议
- 提供1-2条关于如何实现或优化的建议

请确保分析全面、专业且有实用价值。`;

    fetchSSE("/user/chat", {
      body: {
        content: prompt,
        memorized: false,
      },
      onMessage: (text) => {
        try {
          const jsonData = JSON.parse(text);
          setAiDialogLoading(false);

          if (jsonData.message) {
            if (jsonData.type === "thinking" || jsonData.type === "think") {
              thinking += jsonData.message;
              // 直接更新状态，不使用局部变量累加
              setAiFeatureThinking((prev) => prev + jsonData.message);
            } else if (jsonData.type === "content") {
              setAiDialogContent((prev) => {
                return prev + jsonData.message;
              });
            } else if (jsonData.type === "done" && !isCompleted) {
              // 计算生成时间
              isCompleted = true;
              const endTime = Date.now();
              const totalTime = (endTime - startTime) / 1000; // 转换为秒
              setTipInfo({ totalTime });
            }
          }
        } catch (e) {
          console.error("解析JSON数据失败:", e, "原始文本:", text);
        }
      },
      onError: (error) => {
        console.error("AI 内容生成失败:", error);
        setAiDialogContent("内容生成失败，请稍后重试");
        setAiDialogLoading(false);
      },
    });
  };

  // 处理分享
  const handleShare = () => {
    setShowContextMenu(false);
    // 这里只是UI演示，实际逻辑后续实现
    alert(`分享文本：${selectedText}`);
  };

  // 处理复制AI对话框内容
  const handleCopyAIContent = () => {
    navigator.clipboard.writeText(aiDialogContent);
    setAiDialogCopied(true);
    setTimeout(() => {
      setAiDialogCopied(false);
    }, 2000);
  };

  if (!currentSection) {
    return <div>章节不存在</div>;
  }

  const studyProgress = Math.min(
    Math.round(
      ((currentSection.studied_duration + studyTime) /
        currentSection.duration) *
        100
    ),
    100
  );

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-950">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 shadow-sm">
        <div className="container h-full flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              to="/student/course/$courseId"
              params={{ courseId: currentCourse?.id.toString() ?? "" }}
              className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回课程</span>
            </Link>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentSection.title}
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentSection.duration / 60} 分钟
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Progress
                value={studyProgress}
                className="w-48 h-2.5 bg-gray-100"
              />
              <span className="text-sm font-medium text-primary">
                {studyProgress} %
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="pt-16 flex">
        {/* 左侧导航栏 */}
        <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-6">
              {/* 学习进度卡片 */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-4 border border-primary/20">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-primary" />
                  学习进度
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        完成进度
                      </span>
                      <span className="text-sm font-medium text-primary">
                        {studyProgress} %
                      </span>
                    </div>
                    <Progress
                      value={studyProgress}
                      className="h-2 bg-primary/20"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">
                          学习时长
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {Math.floor(studyTime / 60)} 分 {studyTime % 60} 秒
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ListOrdered className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-gray-600 dark:text-gray-400">
                          练习完成
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {exercises.length} 个
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 助手功能 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 px-1">
                  AI 学习助手
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDialogOpen("summary")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        重点总结
                      </div>
                      <div className="text-xs text-gray-500">
                        AI 生成本节重点内容总结
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDialogOpen("hint")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                      <Code className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        练习提示
                      </div>
                      <div className="text-xs text-gray-500">
                        获取练习相关的解题思路
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDialogOpen("outline")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                      <Layout className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        学习大纲
                      </div>
                      <div className="text-xs text-gray-500">
                        查看本节课程结构大纲
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 学习建议 */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    学习建议
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  建议先阅读本章内容，做好笔记后再尝试练习题。如遇到难点，可以使用
                  AI 助手获取提示。
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容 */}
        <main className="flex-1 ml-72">
          <div className="container max-w-4xl mx-auto px-8 py-8">
            {/* 页面标题和操作按钮 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentSection.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatUnixTime(currentSection.updated_at)}
                </p>
              </div>

              {/* AI功能提示 */}
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary text-xs rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>选择文本后右键可使用AI分析</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* 现有的按钮 */}
                  <button
                    onClick={() => handleDialogOpen("summary")}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                    title="AI总结"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  {/* 其他按钮 */}
                </div>
              </div>
            </div>

            {/* 内容标签页 */}
            <div className="mb-6">
              <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("content")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                    activeTab === "content"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  课程内容
                </button>
                <button
                  onClick={() => setActiveTab("exercises")}
                  className={cn(
                    "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2",
                    activeTab === "exercises"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  练习题
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    {exercises.length}
                  </span>
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            {activeTab === "content" ? (
              <div className="space-y-8">
                {/* 视频部分 */}
                {currentSection.video_url && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    {/* 视频标题栏 */}
                    <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">
                            课程视频
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            观看视频学习本章节内容
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 视频播放器 */}
                    <div className="aspect-video bg-black" id="screen">
                      <iframe
                        src={currentSection.video_url}
                        scrolling="no"
                        frameBorder="0"
                        style={{ width: "100%", height: "100%" }}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* 文字内容部分 */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  {/* 文字内容标题栏 */}
                  <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">
                          章节内容
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          详细的文字讲解和示例
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 文字内容主体 */}
                  <div className="p-8">
                    <div className="markdown-body prose dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentSection.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <ListOrdered className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      暂无练习
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      本章节暂未添加任何练习题
                    </p>
                  </div>
                ) : (
                  exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {exercise.title}
                          </h3>
                          <p className="markdown-body text-sm text-gray-600 dark:text-gray-400">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {exercise.description}
                            </ReactMarkdown>
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="lg"
                          className="ml-6 group-hover:border-primary group-hover:text-primary transition-colors"
                          onClick={() => {
                            setCurrentExercise(exercise);
                            navigate({
                              to: "/student/course/section/exercise",
                            });
                          }}
                        >
                          开始练习
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* AI 功能对话框 - 使用新的AIAnalysisDialog组件替换原有的Dialog */}
      <AIAnalysisDialog
        isOpen={!!openDialog}
        onClose={() => {
          setOpenDialog(null);
          // 清空对话框内容
          setAiContent("");
          setAiFeatureThinking("");
          setTipInfo({});
          setIsLoading(false);
        }}
        title={openDialog ? dialogTitles[openDialog] : ""}
        content={aiContent}
        selectedText=""
        isLoading={isLoading}
        onCopy={handleCopy}
        onRegenerate={handleRegenerate}
        copied={aiFeatureDialogCopied}
        analysisType="custom"
        className="sm:max-w-[800px]"
        thinking={aiFeatureThinking}
        tipInfo={tipInfo}
      />

      {/* 右键菜单 */}
      {showContextMenu && (
        <motion.div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-52 overflow-hidden"
          style={{
            top: `${contextMenuPosition.top}px`,
            left: `${contextMenuPosition.left}px`,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            AI 分析选项
          </div>
          <motion.button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 relative overflow-hidden group"
            onClick={handleAskAI}
            whileHover={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="group-hover:text-primary transition-colors">
              向AI提问
            </span>
            <motion.div
              className="absolute inset-0 bg-primary/5 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.button>
          <motion.button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 relative overflow-hidden group"
            onClick={handleListFeatures}
            whileHover={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <List className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="group-hover:text-primary transition-colors">
              列出技术和功能点
            </span>
            <motion.div
              className="absolute inset-0 bg-primary/5 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.button>
          <motion.button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 relative overflow-hidden group"
            onClick={handleShare}
            whileHover={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Share2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="group-hover:text-primary transition-colors">
              分享
            </span>
            <motion.div
              className="absolute inset-0 bg-primary/5 pointer-events-none"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
          </motion.button>
        </motion.div>
      )}

      {/* AI 分析对话框 */}
      <AIAnalysisDialog
        isOpen={showAIDialog}
        onClose={() => {
          setShowAIDialog(false);
          // 清空对话框内容
          setAiDialogContent("");
          setAiFeatureThinking("");
          setTipInfo({});
          setAiDialogLoading(false);
        }}
        title={aiDialogTitle}
        content={aiDialogContent}
        selectedText={selectedText}
        isLoading={aiDialogLoading}
        onCopy={handleCopyAIContent}
        onRegenerate={handleRegenerateAIContent}
        onAsk={handleUserQuestion}
        copied={aiDialogCopied}
        analysisType={aiDialogType}
        thinking={aiFeatureThinking}
        tipInfo={tipInfo}
      />
    </div>
  );
}

export const Route = createFileRoute("/student/course/section/$sectionId")({
  component: StudentSectionDetail,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    if (role !== "student") {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});
