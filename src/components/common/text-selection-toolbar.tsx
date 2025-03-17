import { useState, useEffect, useRef } from "react";
import { Brain, List, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface TextSelectionToolbarProps {
  onAskAI?: (selectedText: string) => void;
  onListFeatures?: (selectedText: string) => void;
  onShare?: (selectedText: string) => void;
  className?: string;
}

export function TextSelectionToolbar({
  onAskAI,
  onListFeatures,
  onShare,
  className,
}: TextSelectionToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedText, setSelectedText] = useState("");
  const toolbarRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<number | null>(null);
  const lastSelectionRef = useRef<string>("");
  const isMouseDownRef = useRef(false);

  // 计算工具栏位置的函数
  const calculateToolbarPosition = () => {
    const selection = window.getSelection();

    if (!selection) return false;

    const selectionText = selection.toString().trim();

    // 如果没有选中文本或选中的是相同的文本，则不更新
    if (
      selectionText === "" ||
      (selectionText === lastSelectionRef.current && visible)
    ) {
      return visible;
    }

    // 更新最后选中的文本
    lastSelectionRef.current = selectionText;

    if (!selection.isCollapsed) {
      try {
        // 获取选中区域的所有范围
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();

        // 如果没有获取到矩形区域，则使用边界矩形
        if (!rects || rects.length === 0) {
          const rect = range.getBoundingClientRect();
          if (!rect || rect.width === 0) return false;

          positionToolbarFromRect(rect, selectionText);
          return true;
        }

        // 使用第一个矩形区域（通常是选中文本的开始部分）
        const firstRect = rects[0];
        positionToolbarFromRect(firstRect, selectionText);
        return true;
      } catch (e) {
        console.error("Error calculating toolbar position:", e);
        return false;
      }
    }

    return false;
  };

  // 根据矩形区域定位工具栏
  const positionToolbarFromRect = (rect: DOMRect, text: string) => {
    // 保存选中的文本
    setSelectedText(text);

    // 确保工具栏在视口内
    const toolbarHeight = toolbarRef.current?.offsetHeight || 40;
    const toolbarWidth = toolbarRef.current?.offsetWidth || 150;

    // 计算初始位置（在选中文本的上方中心）
    let top = rect.top + window.scrollY - toolbarHeight - 10; // 10px 的间距
    let left = rect.left + window.scrollX + rect.width / 2;

    // 确保工具栏不会超出视口左侧
    if (left - toolbarWidth / 2 < 10) {
      left = 10 + toolbarWidth / 2;
    }

    // 确保工具栏不会超出视口右侧
    if (left + toolbarWidth / 2 > window.innerWidth - 10) {
      left = window.innerWidth - 10 - toolbarWidth / 2;
    }

    // 如果工具栏会超出视口顶部，则将其放在选中文本的下方
    if (top < window.scrollY + 10) {
      top = rect.bottom + window.scrollY + 10;
    }

    setPosition({ top, left });
    setVisible(true);
  };

  // 处理选择变化
  const handleSelectionChange = () => {
    // 如果鼠标按下状态，不处理选择变化（等待鼠标松开）
    if (isMouseDownRef.current) return;

    // 清除之前的定时器
    if (selectionTimeoutRef.current) {
      window.clearTimeout(selectionTimeoutRef.current);
    }

    // 使用定时器延迟处理，避免频繁更新
    selectionTimeoutRef.current = window.setTimeout(() => {
      const hasSelection = calculateToolbarPosition();
      if (!hasSelection) {
        setVisible(false);
      }
    }, 100);
  };

  // 处理鼠标按下事件
  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };

  // 处理鼠标松开事件
  const handleMouseUp = () => {
    isMouseDownRef.current = false;

    // 延迟一点时间再处理选择，确保选择已经完成
    setTimeout(() => {
      calculateToolbarPosition();
    }, 10);
  };

  // 处理滚动事件
  const handleScroll = () => {
    if (visible) {
      // 滚动时重新计算位置
      calculateToolbarPosition();
    }
  };

  // 处理窗口大小变化
  const handleResize = () => {
    if (visible) {
      calculateToolbarPosition();
    }
  };

  // 监听选择变化事件
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (selectionTimeoutRef.current) {
        window.clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [visible]);

  // 点击工具栏外部时隐藏工具栏
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        // 检查点击是否在选中的文本范围内
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            const clickX = event.clientX;
            const clickY = event.clientY;

            // 如果点击在选中文本范围内，不隐藏工具栏
            if (
              clickX >= rect.left &&
              clickX <= rect.right &&
              clickY >= rect.top &&
              clickY <= rect.bottom
            ) {
              return;
            }
          } catch (e) {
            console.error("Error checking click position:", e);
          }
        }

        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={toolbarRef}
          className={cn(
            "fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center p-1.5 transform -translate-x-1/2",
            className
          )}
          style={{
            top: position.top,
            left: position.left,
            pointerEvents: "auto", // 确保工具栏可以接收鼠标事件
          }}
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.8,
          }}
        >
          <motion.button
            onClick={() => onAskAI?.(selectedText)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="向AI提问"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-4 h-4" />
          </motion.button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <motion.button
            onClick={() => onListFeatures?.(selectedText)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="列出技术和功能点"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <List className="w-4 h-4" />
          </motion.button>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
          <motion.button
            onClick={() => onShare?.(selectedText)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="分享"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
