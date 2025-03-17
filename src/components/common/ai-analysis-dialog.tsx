import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Copy,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  Send,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "motion/react";

interface AIAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  selectedText: string;
  isLoading?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onAsk?: (question: string) => void;
  copied?: boolean;
  className?: string;
  analysisType?: "question" | "features" | "custom";
  thinking?: string;
  tipInfo?: { totalTime?: number };
}

export function AIAnalysisDialog({
  isOpen,
  onClose,
  title,
  content,
  selectedText,
  isLoading = false,
  onCopy,
  onRegenerate,
  onAsk,
  copied = false,
  className,
  analysisType = "question",
  thinking = "",
  tipInfo = {},
}: AIAnalysisDialogProps) {
  const [question, setQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // 当对话框打开时，自动聚焦到输入框
  useEffect(() => {
    if (isOpen && inputRef.current && analysisType === "question") {
      inputRef.current.focus();
    }
  }, [isOpen, analysisType]);

  // 处理提交问题
  const handleSubmitQuestion = () => {
    if (question.trim() && onAsk) {
      onAsk(question);
      setQuestion("");
    }
  };

  // 处理按键事件，按下Enter键提交问题
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion();
    }
  };

  // 滚动到最新内容
  useEffect(() => {
    if (dialogContentRef.current && (content || thinking)) {
      dialogContentRef.current.scrollTop =
        dialogContentRef.current.scrollHeight;
    }
  }, [content, thinking]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn(
              "bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col",
              className
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
          >
            {/* 对话框头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={onCopy}
                  className={cn(
                    "p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    copied && "text-green-500 dark:text-green-400"
                  )}
                  title="复制内容"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="关闭"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* 生成时间信息 */}
            {tipInfo.totalTime && (
              <div className="px-6 pt-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  生成耗时: {tipInfo.totalTime.toFixed(2)}s
                </span>
              </div>
            )}

            {/* 选中的文本 */}
            {selectedText && (
              <div className="px-6 pt-4 pb-2">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-primary border border-gray-200 dark:border-gray-700/50 text-sm text-gray-700 dark:text-gray-300 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary font-medium">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    引用内容
                  </div>
                  <div className="pl-2 border-l border-gray-200 dark:border-gray-700 line-clamp-3">
                    {selectedText}
                  </div>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-lg pointer-events-none" />
                </div>
              </div>
            )}

            {/* 询问框 - 仅在问题模式下显示 */}
            {analysisType === "question" && !isLoading && (
              <div className="px-6 pt-2 pb-4">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="基于选中内容，向AI提问..."
                    className="w-full px-4 py-3 pr-12 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-800 dark:text-gray-200 resize-none"
                    rows={2}
                  />
                  <motion.button
                    onClick={handleSubmitQuestion}
                    disabled={!question.trim()}
                    className="absolute right-3 bottom-3 p-1.5 rounded-md text-gray-500 hover:text-primary disabled:opacity-50 disabled:hover:text-gray-500"
                    whileHover={question.trim() ? { scale: 1.1 } : {}}
                    whileTap={question.trim() ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* 对话框内容 */}
            <div
              className="flex-1 overflow-y-auto px-6 pb-6"
              ref={dialogContentRef}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <motion.div
                    className="relative"
                    animate={{
                      rotate: [0, 10, 0, -10, 0],
                      y: [0, -5, 0, -5, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                    </motion.div>
                  </motion.div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      AI 正在分析中...
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {analysisType === "question" &&
                        "正在理解您的问题，生成回答"}
                      {analysisType === "features" &&
                        "正在分析内容，提取技术和功能点"}
                      {analysisType === "custom" && "正在处理您的请求"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 思考过程 - 修复显示条件，确保在有thinking内容时总是显示 */}
                  {thinking && thinking.trim() !== "" && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 text-sm border border-blue-100 dark:border-blue-800/30 relative mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
                        </div>
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                          思考过程
                        </span>
                      </div>
                      <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-800/50">
                        <p className="whitespace-pre-wrap text-blue-700 dark:text-blue-200 leading-relaxed">
                          {thinking}
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/5 to-transparent rounded-br-lg pointer-events-none" />
                    </div>
                  )}

                  {/* AI 回答 */}
                  <motion.div
                    className="markdown-body prose dark:prose-invert max-w-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content}
                    </ReactMarkdown>
                  </motion.div>
                </div>
              )}
            </div>

            {/* 对话框底部 */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-500">
                    这个回答对你有帮助吗？
                  </p>
                  <div className="flex items-center gap-2">
                    <motion.button
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      有帮助
                    </motion.button>
                    <motion.button
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      需改进
                    </motion.button>
                  </div>
                </div>
                <motion.button
                  onClick={onRegenerate}
                  disabled={isLoading}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={!isLoading ? { scale: 1.05 } : {}}
                  whileTap={!isLoading ? { scale: 0.95 } : {}}
                >
                  <RefreshCw
                    className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
                  />
                  重新生成
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
