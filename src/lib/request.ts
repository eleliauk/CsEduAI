// src/utils/request.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { toast } from "sonner";

// 定义响应数据接口
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过错误处理
  showSuccessMessage?: boolean; // 是否显示成功提示
}

// 错误信息接口
interface ErrorResponse {
  message: string;
  code?: number;
  [key: string]: any;
}

// 流式响应回调函数类型
type StreamCallback = (text: string) => void;

class RequestService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "https://wishchain.muxi.org.cn/api/v1",
      timeout: 0,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        console.error("Request error:", error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data, config, status } = response;
        const requestConfig = config as RequestConfig;

        // 处理预检请求响应
        if (status === 204) {
          return response;
        }

        // 处理流式请求响应 - 直接返回原始响应，让专门的处理函数去处理
        if (
          config.responseType === "text" &&
          config.headers?.Accept === "text/event-stream"
        ) {
          return response;
        }

        // console.log({ status, data, config });

        // 处理普通请求响应
        if (data.code === 200) {
          return data.data;
        } else {
          if (!requestConfig.skipErrorHandler) {
            toast.error(data.message || "请求失败");
          }
          return Promise.reject(new Error(data.message || "请求失败"));
        }
      },
      (error: AxiosError<ErrorResponse>) => {
        const requestConfig = error.config as RequestConfig;
        if (!requestConfig.skipErrorHandler) {
          const errorMessage =
            error.response?.data?.message || error.message || "服务器错误";
          toast.error(errorMessage);
        }
        return Promise.reject(error);
      }
    );
  }

  // 通用请求方法
  private async request<T = any>(config: RequestConfig): Promise<T> {
    try {
      return await this.instance.request(config);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // GET 请求
  public async get<T = any>(
    url: string,
    params?: any,
    config: Omit<RequestConfig, "params"> = {}
  ): Promise<T> {
    return this.request<T>({ ...config, method: "get", url, params });
  }

  // POST 请求
  public async post<T = any>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, "data"> = {}
  ): Promise<T> {
    return this.request<T>({ ...config, method: "post", url, data });
  }

  // PUT 请求
  public async put<T = any>(
    url: string,
    data?: any,
    config: Omit<RequestConfig, "data"> = {}
  ): Promise<T> {
    return this.request<T>({ ...config, method: "put", url, data });
  }

  // DELETE 请求
  public async delete<T = any>(
    url: string,
    params?: any,
    config: Omit<RequestConfig, "params"> = {}
  ): Promise<T> {
    return this.request<T>({ ...config, method: "delete", url, params });
  }

  // 流式POST请求
  public async streamPost(
    url: string,
    data: any,
    onMessage: StreamCallback,
    config: Omit<RequestConfig, "data"> = {}
  ): Promise<void> {
    try {
      const response = await this.instance.post(url, data, {
        ...config,
        responseType: "stream",
        headers: {
          ...config.headers,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });

      const reader = response.data.getReader();
      const decoder = new TextDecoder();
      let partialLine = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码二进制数据
        const text = decoder.decode(value, { stream: true });
        const lines = (partialLine + text).split("\n");

        // 保存最后一行，可能是不完整的
        partialLine = lines[lines.length - 1];

        // 处理完整的行
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data && data !== "[DONE]") {
              // console.log("收到数据:", data);
              onMessage(data);
            } else if (data === "[DONE]") {
              // console.log("流式传输完成");
              return;
            }
          }
        }
      }

      // 处理最后一行（如果有的话）
      if (partialLine.trim()) {
        const line = partialLine.trim();
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data && data !== "[DONE]") {
            // console.log("最后一条数据:", data);
            onMessage(data);
          }
        }
      }
    } catch (error) {
      const requestConfig = (error as AxiosError).config as RequestConfig;
      if (!requestConfig?.skipErrorHandler) {
        const errorMessage = (error as AxiosError).message || "流式请求失败";
        toast.error(errorMessage);
      }
      throw error;
    }
  }

  // 获取基础URL
  public getBaseURL(): string {
    return this.instance.defaults.baseURL || "";
  }
}

// 导出请求实例
export const request = new RequestService();

// 流式请求函数
export const fetchSSE = async (
  url: string,
  options: {
    onMessage: (text: string) => void;
    onError?: (error: Error) => void;
    body?: Record<string, any>;
    headers?: Record<string, string>;
  }
) => {
  const { onMessage, onError, body, headers = {} } = options;
  // console.log("开始SSE请求:", { url, body });

  try {
    const response = await fetch(`${request.getBaseURL()}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        ...headers,
      },
      body: JSON.stringify(body),
    });

    // console.log("SSE响应状态:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      // console.log("读取到数据块:", { done, valueLength: value?.length });

      if (done) {
        // console.log("流读取完成");
        break;
      }

      // 解码新的数据块并添加到缓冲区
      const chunk = decoder.decode(value, { stream: true });
      // console.log("解码后的数据块:", chunk);
      buffer += chunk;

      // 处理缓冲区中的完整行
      const lines = buffer.split("\n");
      // console.log("分割后的行数:", lines.length);

      // 保留最后一个可能不完整的行
      buffer = lines.pop() || "";

      // 处理每一行
      for (const line of lines) {
        const trimmedLine = line.trim();
        // console.log("处理行:", trimmedLine);

        if (trimmedLine.startsWith("data:")) {
          // 移除 "data:" 前缀并解析 JSON
          const jsonStr = trimmedLine.slice(5);
          // console.log("JSON字符串:", jsonStr);

          try {
            const jsonData = JSON.parse(jsonStr);
            // console.log("解析后的JSON:", jsonData);

            if (jsonData.message) {
              // console.log("提取的消息:", jsonData.message);
              onMessage(JSON.stringify(jsonData));
            }
          } catch (e) {
            console.error("JSON解析失败:", e);
          }
        }
      }
    }

    // 处理最后一行（如果有的话）
    if (buffer) {
      // console.log("处理最后的缓冲区:", buffer);
      const trimmedLine = buffer.trim();
      if (trimmedLine.startsWith("data: ")) {
        const data = trimmedLine.slice(6);
        if (data !== "[DONE]") {
          // console.log("最后一条数据:", data);
          onMessage(data);
        }
      }
    }
  } catch (error) {
    console.error("Stream request failed:", error);
    onError?.(error as Error);
  }
};
