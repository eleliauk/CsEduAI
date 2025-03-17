import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { loginSchema } from "../shemas";
import { request } from "@/lib/request";
import { toast } from "sonner";

// 定义登录响应接口
interface LoginResponse {
  code: number;
  data: {
    redirect_url: string;
    role: string;
    token: {
      access_token: string;
      expire_in: number;
      refresh_token: string;
      token_type: string;
    };
  };
  message: string;
}

export const useLogin = ({ userType }: { userType: "student" | "teacher" }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof loginSchema>) => {
      return request.post<LoginResponse["data"]>(
        `/user/${userType}/login`,
        data
      );
    },
    onSuccess: (data) => {
      // 登录成功后的操作
      const { token, redirect_url, role } = data;
      const { access_token, refresh_token, token_type, expire_in } = token;
      toast.success("Login success!");
      // 保存 token 到 localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem("expire_in", expire_in.toString());
      localStorage.setItem("role", role);
      // 清除之前的查询缓存
      queryClient.clear();
      // 跳转到首页或其他页面
      router.navigate({ to: redirect_url });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return mutation;
};
