import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetVerificationCode } from "../api/use-get-verificaition-code";
import { useLogin } from "../api/use-login";
import { loginSchema } from "../shemas";
import { Sparkles, Github, ArrowRight, ArrowLeft, Mail } from "lucide-react";

type Step = "email" | "verify_code";
type UserType = "student" | "teacher";

export function LoginCard({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [step, setStep] = useState<Step>("email");
  const [userType, setUserType] = useState<UserType>("student");
  const { mutate: getVerifyCode } = useGetVerificationCode();
  const { mutate: login } = useLogin({ userType });
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; size: number; color: string; speed: number }>
  >([]);

  // 创建粒子效果
  useEffect(() => {
    const particlesArray = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      color: `hsl(${Math.random() * 360}, 70%, 70%)`,
      speed: Math.random() * 0.5 + 0.1,
    }));
    setParticles(particlesArray);

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y > 100 ? 0 : p.y + p.speed,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      verify_code: "",
    },
  });

  const handleContinue = async () => {
    const emailResult = await form.trigger("email");
    if (emailResult) {
      setIsLoading(true);
      getVerifyCode({ email: form.getValues("email") });
      setTimeout(() => {
        setIsLoading(false);
        setStep("verify_code");
      }, 1000);
    }
  };

  const handleBack = () => {
    setStep("email");
  };

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    login(values);
    setTimeout(() => {
      setIsLoading(false);
      form.reset();
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/40 bg-background/95 p-6 shadow-lg backdrop-blur-sm">
      {/* 背景粒子效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
            }}
            animate={{
              y: ["0%", "100%"],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 / particle.speed,
              repeat: Infinity,
              ease: "linear",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <Form {...form}>
        <form
          className={cn("flex flex-col gap-6 relative z-10", className)}
          onSubmit={form.handleSubmit(onSubmit)}
          {...props}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-2"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">欢迎回来</h1>
            </motion.div>

            <Tabs
              defaultValue="student"
              className="w-full"
              onValueChange={(value) => setUserType(value as UserType)}
            >
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                <TabsTrigger
                  value="student"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  学生登录
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  管理员登录
                </TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <p className="text-balance text-sm text-muted-foreground mt-2">
                  {step === "email"
                    ? "输入您的学生邮箱以登录账户"
                    : "输入发送到您邮箱的验证码"}
                </p>
              </TabsContent>
              <TabsContent value="teacher">
                <p className="text-balance text-sm text-muted-foreground mt-2">
                  {step === "email"
                    ? "输入您的管理员邮箱以登录账户"
                    : "输入发送到您邮箱的验证码"}
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div className="grid gap-6">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.div
                  key="email"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="grid gap-3"
                >
                  <FormField
                    name="email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {userType === "student" ? "学生邮箱" : "管理员邮箱"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              placeholder={
                                userType === "student"
                                  ? "student@example.com"
                                  : "teacher@example.com"
                              }
                              autoComplete="email webauthn"
                              className="pl-10 h-11 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handleContinue}
                    className="w-full mt-2 h-11 group relative overflow-hidden"
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? "发送验证码中..." : "继续"}
                      {!isLoading && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light"
                      initial={{ x: "-100%" }}
                      animate={{ x: isLoading ? "0%" : "-100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="verify_code"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="grid gap-3"
                >
                  <FormField
                    control={form.control}
                    name="verify_code"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium">
                          验证码
                        </FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field} className="gap-2">
                            <InputOTPGroup className="w-full gap-2">
                              <InputOTPSlot
                                index={0}
                                className="flex-1 h-12 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                              />
                              <InputOTPSlot
                                index={1}
                                className="flex-1 h-12 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                              />
                              <InputOTPSlot
                                index={2}
                                className="flex-1 h-12 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                              />
                              <InputOTPSlot
                                index={3}
                                className="flex-1 h-12 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                              />
                              <InputOTPSlot
                                index={4}
                                className="flex-1 h-12 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                              />
                              <InputOTPSlot
                                index={5}
                                className="flex-1 h-12 bg-muted/40 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
                              />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormDescription className="text-xs text-center">
                          请输入发送到您邮箱的6位验证码
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="w-full h-11 group"
                      disabled={isLoading}
                    >
                      <span className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        返回
                      </span>
                    </Button>
                    <Button
                      type="submit"
                      className="w-full h-11 group relative overflow-hidden"
                      disabled={isLoading}
                    >
                      <span className="relative z-10">
                        {isLoading ? "登录中..." : "登录"}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light"
                        initial={{ x: "-100%" }}
                        animate={{ x: isLoading ? "0%" : "-100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative text-center text-sm mt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-2 text-xs text-muted-foreground">
                  或者使用以下方式
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11 group relative overflow-hidden bg-muted/40 border-muted-foreground/20 hover:bg-muted/60 transition-all duration-200"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Github className="h-4 w-4 transition-transform group-hover:scale-110" />
                使用GitHub登录
              </span>
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary to-primary/40"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
