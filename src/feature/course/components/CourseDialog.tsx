import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id?: string;
    title: string;
    description: string;
    cover?: string;
    tag?: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    cover: string;
    tag: string;
  }) => void;
}

export function CourseDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: CourseDialogProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    tag: initialData?.tag || "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    initialData?.cover || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 清理预览URL
  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 当对话框关闭时重置状态
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(initialData?.cover || "");
      setFormData({
        title: initialData?.title || "",
        description: initialData?.description || "",
        tag: initialData?.tag || "",
      });
    }
  }, [open, initialData]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 如果之前有本地预览URL，先清理掉
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }

      // 创建新的预览URL
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let coverUrl = initialData?.cover || "";

      // 如果有选择新文件，先上传图片
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch(
          "http://47.120.14.30:8080/api/v1/user/oss/upload",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        coverUrl = data.data.url;
      }

      // 提交表单数据
      onSubmit({
        ...formData,
        cover: coverUrl,
      });

      // 清理本地预览URL
      if (previewUrl && !previewUrl.startsWith("http")) {
        URL.revokeObjectURL(previewUrl);
      }
      toast.success("创建成功");
      onOpenChange(false);
    } catch (error) {
      console.error("提交失败:", error);
      toast.error("创建失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "编辑课程" : "创建课程"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "修改课程信息，完成后点击保存"
              : "填写课程信息，完成后点击创建"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cover" className="text-right">
                课程封面
              </Label>
              <div className="col-span-3">
                <div className="mb-4 relative aspect-video rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="课程封面预览"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <Input
                    id="cover"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-2 right-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-1"
                      disabled={isSubmitting}
                    >
                      <Upload className="w-4 h-4" />
                      选择图片
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                课程名称
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tag" className="text-right">
                课程标签
              </Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tag: e.target.value }))
                }
                placeholder="例如：前端开发、Java、Python等"
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                课程描述
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "提交中..." : initialData ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
