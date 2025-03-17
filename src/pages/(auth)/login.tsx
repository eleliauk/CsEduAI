import { GalleryVerticalEnd } from "lucide-react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { LoginCard } from "@/feature/auth/components/login-card";
import { motion } from "motion/react";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
  beforeLoad: () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (role && token) {
      throw redirect({
        to: "/welcome",
      });
    }
  },
});

function LoginPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-gradient-to-br from-background via-background to-background/90">
      {/* 背景装饰元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_6px_rgba(var(--primary-rgb),0.1)]" />
        <div className="absolute top-[30%] right-[30%] w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_6px_rgba(var(--primary-rgb),0.1)]" />
        <div className="absolute bottom-[20%] left-[40%] w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_6px_rgba(var(--primary-rgb),0.1)]" />
      </div>

      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-2 md:justify-start"
          >
            <Link href="/" className="flex items-center gap-2 font-medium">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-md">
                <GalleryVerticalEnd className="size-5" />
              </div>
              <span className="flex items-center font-semibold text-lg">
                基于大模型的计算机专业辅助教学系统
              </span>
            </Link>
          </motion.div>
          <div className="flex flex-1 items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full max-w-md"
            >
              <LoginCard />
            </motion.div>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"
          >
            {/* 文字部分移到上方 */}
            <div className="absolute inset-x-0 top-20 flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center max-w-md"
              >
                <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">
                  智能学习，从这里开始
                </h2>
                <p className="text-muted-foreground text-lg">
                  基于大模型的计算机专业辅助教学系统，为您提供个性化学习体验
                </p>
              </motion.div>
            </div>

            {/* 动画部分 */}
            <div className="absolute inset-0 flex items-center justify-center p-10 pt-32">
              {/* 学习场景动画 */}
              <div className="relative w-full max-w-xl h-[400px]">
                {/* 背景圆形 */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-blue-100/30 dark:bg-blue-900/10"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* 桌子 */}
                <motion.div
                  className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[280px] h-[10px] bg-blue-400 rounded-full opacity-70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                />

                {/* 人物1 - 左侧 */}
                <motion.div
                  className="absolute bottom-[22%] left-[30%] w-[80px] h-[120px]"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 1 }}
                >
                  {/* 头部 */}
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-red-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  {/* 身体 */}
                  <div className="absolute top-[35px] left-1/2 -translate-x-1/2 w-[35px] h-[60px] bg-red-500 rounded-lg" />
                  {/* 手臂 - 动画 */}
                  <motion.div
                    className="absolute top-[45px] right-[5px] w-[25px] h-[8px] bg-red-400 rounded-full origin-left"
                    animate={{ rotate: [0, 15, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  {/* 腿 */}
                  <div className="absolute bottom-0 left-[15px] w-[12px] h-[25px] bg-yellow-500 rounded-lg" />
                  <div className="absolute bottom-0 right-[15px] w-[12px] h-[25px] bg-yellow-500 rounded-lg" />
                </motion.div>

                {/* 人物2 - 右侧 */}
                <motion.div
                  className="absolute bottom-[22%] right-[30%] w-[80px] h-[120px]"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 1.2 }}
                >
                  {/* 头部 */}
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-blue-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  />
                  {/* 身体 */}
                  <div className="absolute top-[35px] left-1/2 -translate-x-1/2 w-[35px] h-[60px] bg-blue-500 rounded-lg" />
                  {/* 手臂 - 动画 */}
                  <motion.div
                    className="absolute top-[45px] left-[5px] w-[25px] h-[8px] bg-blue-400 rounded-full origin-right"
                    animate={{ rotate: [0, -15, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.7,
                    }}
                  />
                  {/* 腿 */}
                  <div className="absolute bottom-0 left-[15px] w-[12px] h-[25px] bg-green-500 rounded-lg" />
                  <div className="absolute bottom-0 right-[15px] w-[12px] h-[25px] bg-green-500 rounded-lg" />
                </motion.div>

                {/* 笔记本电脑 */}
                <motion.div
                  className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-[100px] h-[60px]"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                >
                  {/* 屏幕 */}
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[50px] bg-gray-700 rounded-md border-2 border-gray-800"
                    animate={{ rotateX: -10 }}
                    style={{ transformOrigin: "bottom" }}
                  >
                    {/* 屏幕内容 */}
                    <motion.div
                      className="absolute top-[10px] left-[10px] w-[60px] h-[4px] bg-blue-400 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-[20px] left-[10px] w-[40px] h-[4px] bg-green-400 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    />
                    <motion.div
                      className="absolute top-[30px] left-[10px] w-[50px] h-[4px] bg-purple-400 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    />
                  </motion.div>
                  {/* 键盘部分 */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100px] h-[10px] bg-gray-600 rounded-sm" />
                </motion.div>

                {/* 悬浮对话框和图标 */}
                <motion.div
                  className="absolute top-[15%] left-[25%] w-[70px] h-[50px] bg-white dark:bg-gray-800 rounded-lg shadow-md flex items-center justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: [-2, 2, -2] }}
                  transition={{
                    y: { duration: 0.5, delay: 2 },
                    opacity: { duration: 0.5, delay: 2 },
                    rotate: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <div className="grid grid-cols-2 gap-1 p-2">
                    <div className="w-[10px] h-[10px] bg-blue-400 rounded-sm"></div>
                    <div className="w-[10px] h-[10px] bg-green-400 rounded-sm"></div>
                    <div className="w-[10px] h-[10px] bg-yellow-400 rounded-sm"></div>
                    <div className="w-[10px] h-[10px] bg-red-400 rounded-sm"></div>
                  </div>
                  {/* 小三角 */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-gray-800"></div>
                </motion.div>

                <motion.div
                  className="absolute top-[20%] right-[25%] w-[80px] h-[40px] bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-md flex items-center justify-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: [2, -2, 2] }}
                  transition={{
                    y: { duration: 0.5, delay: 2.2 },
                    opacity: { duration: 0.5, delay: 2.2 },
                    rotate: {
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    },
                  }}
                >
                  <div className="flex space-x-1">
                    <div className="w-[40px] h-[4px] bg-blue-400 rounded-full"></div>
                    <div className="w-[15px] h-[4px] bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-100 dark:border-t-blue-900/30"></div>
                </motion.div>

                {/* 浮动粒子 */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute rounded-full ${
                      [
                        "bg-blue-400",
                        "bg-green-400",
                        "bg-yellow-400",
                        "bg-purple-400",
                        "bg-red-400",
                      ][i % 5]
                    }`}
                    style={{
                      width: `${Math.random() * 6 + 3}px`,
                      height: `${Math.random() * 6 + 3}px`,
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 60 + 10}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0, 0.7, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
