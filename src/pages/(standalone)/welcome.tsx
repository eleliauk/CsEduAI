import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/(standalone)/welcome")({
  component: RouteComponent,
});

interface NeuralNodeProps {
  x: string;
  y: string;
  delay?: number;
}

interface DataFlowProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay?: number;
}

// 神经网络节点组件
const NeuralNode = ({ x, y, delay = 0 }: NeuralNodeProps) => (
  <motion.div
    className="absolute w-2 h-2 bg-primary rounded-full"
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 1, 0],
      opacity: [0, 1, 1, 0],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// 数据流动画组件
const DataFlow = ({ startX, startY, endX, endY, delay = 0 }: DataFlowProps) => (
  <motion.div
    className="absolute bg-primary/20 h-[2px] origin-left"
    style={{
      left: startX,
      top: startY,
      width: Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)),
      transform: `rotate(${Math.atan2(endY - startY, endX - startX)}rad)`,
    }}
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{
      scaleX: [0, 1],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const LoadingAnimation = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* 背景装饰圆环 */}
        <motion.div
          className="absolute w-[300px] h-[300px] border border-primary/20 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] border border-primary/10 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        {/* 神经网络节点和连接 */}
        <div className="absolute w-[500px] h-[500px]">
          {/* 左侧节点 */}
          <NeuralNode x="50px" y="150px" delay={0} />
          <NeuralNode x="50px" y="250px" delay={0.3} />
          <NeuralNode x="50px" y="350px" delay={0.6} />

          {/* 中间节点 */}
          <NeuralNode x="250px" y="200px" delay={0.2} />
          <NeuralNode x="250px" y="300px" delay={0.5} />

          {/* 右侧节点 */}
          <NeuralNode x="450px" y="250px" delay={0.4} />

          {/* 连接线 */}
          <DataFlow startX={52} startY={152} endX={250} endY={200} delay={0} />
          <DataFlow
            startX={52}
            startY={252}
            endX={250}
            endY={200}
            delay={0.3}
          />
          <DataFlow
            startX={52}
            startY={352}
            endX={250}
            endY={300}
            delay={0.6}
          />
          <DataFlow
            startX={252}
            startY={202}
            endX={450}
            endY={250}
            delay={0.2}
          />
          <DataFlow
            startX={252}
            startY={302}
            endX={450}
            endY={250}
            delay={0.5}
          />
        </div>

        {/* 主要加载动画 */}
        <div className="relative flex items-center justify-center mb-12">
          {/* 旋转的外圈 */}
          <motion.div
            className="absolute w-24 h-24 border-4 border-primary/30 rounded-full border-t-primary"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* AI 核心 */}
          <motion.div
            className="absolute w-16 h-16 bg-gradient-to-br from-primary/20 to-primary rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* 脉冲效果 */}
          <motion.div
            className="absolute w-12 h-12 bg-primary/20 rounded-full"
            animate={{
              scale: [1, 2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* 中心图标 */}
          <motion.div
            className="absolute text-primary text-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            🧠
          </motion.div>
        </div>

        {/* 文字动画 */}
        <div className="flex flex-col items-center gap-3 relative">
          <motion.div
            className="text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            AI + 学习
          </motion.div>
          <motion.div
            className="text-muted-foreground text-sm flex flex-col items-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span>正在初始化智能学习环境</span>
            <motion.span
              className="text-xs text-primary/60"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Initializing AI Learning Environment
            </motion.span>
          </motion.div>

          {/* 二进制数字流 */}
          <motion.div
            className="absolute -z-10 text-[10px] text-primary/20 whitespace-nowrap"
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: 100,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            10110101 01101001 11001010
          </motion.div>
        </div>

        {/* 底部装饰点 */}
        <div className="absolute bottom-[-100px] flex gap-3">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/40"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function RouteComponent() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (role) {
        navigate({
          to: `/${role}/course`,
        });
      } else {
        navigate({
          to: "/login",
        });
      }
    }, 3000); // 添加一个短暂的延迟以展示加载动画

    return () => clearTimeout(timer);
  }, [role, navigate]);

  return <LoadingAnimation />;
}
