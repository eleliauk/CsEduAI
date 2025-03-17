import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DottedSeparator } from "@/components/common/dotted-separator";

import {
  ADVENTURER_AVATAR,
  LORELEI_AVATAR,
  NOTIONISTS_AVATAR,
  MICAH_AVATAR,
} from "../constants";
import { useRef } from "react";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  avatar: z.union([z.instanceof(File), z.string().trim().min(1, "Required")]),
});

const defaultAvatars = [
  {
    style: "adventurer  ",
    avatars: ADVENTURER_AVATAR,
  },
  {
    style: "lorelei",
    avatars: LORELEI_AVATAR,
  },
  {
    style: "notionists",
    avatars: NOTIONISTS_AVATAR,
  },
  {
    style: "micah",
    avatars: MICAH_AVATAR,
  },
];

export const ProfileCard = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("avatar", file);
    }
  };

  const handleDefaultAvatarClick = async (avatarPath: string) => {
    try {
      const response = await fetch(avatarPath);
      const svgText = await response.text();

      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const fileName = avatarPath.split("/").pop() || "avatar.svg";

      // 创建 File 对象
      const file = new File([blob], fileName, {
        type: "image/svg+xml",
      });

      form.setValue("avatar", file);
    } catch (error) {
      console.error("Error converting SVG to file:", error);
    }
  };

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    console.log(values);
  };

  return (
    <Card className="border-none border-neutral-400 shadow-none">
      <CardHeader className="flex px-7 py-4">
        <CardTitle className="text-xl font-bold">
          Initialize your account
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="px-7 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your username" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="size-[72px] relative rounded-full overflow-hidden">
                          <img
                            src={
                              field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                            }
                            alt="avatar"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <FormLabel>Avatar</FormLabel>
                        <FormDescription>
                          JPG, PNG, SVG or JPEG, max 1mb
                        </FormDescription>
                        <input
                          className="hidden"
                          type="file"
                          accept=".jpg, .png, .jpeg, .svg"
                          ref={inputRef}
                          onChange={handleImageChange}
                        />
                        {field.value ? (
                          <Button
                            type="button"
                            variant="destructive"
                            size="xs"
                            className="w-fit mt-2"
                            onClick={() => {
                              field.onChange(null);
                              if (inputRef.current) {
                                inputRef.current.value = "";
                              }
                            }}
                          >
                            Remove Image
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="tertiary"
                            size="xs"
                            className="w-fit mt-2"
                            onClick={() => {
                              if (inputRef.current) {
                                inputRef.current.click();
                              }
                            }}
                          >
                            Upload Image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className="py-4">
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border mb-4">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Choose a default avatar
                </span>
              </div>
              {defaultAvatars.map(({ style, avatars }) => (
                <div key={style}>
                  <div className="flex flex-wrap justify-around mb-4">
                    {avatars.map((avatar, index) => (
                      <div key={index}>
                        <Avatar
                          onClick={() => handleDefaultAvatarClick(avatar)}
                          className="size-16 border-2 border-neutral-200 rounded-full hover:border-neutral-400 transition-all duration-300 cursor-pointer"
                        >
                          <AvatarImage src={avatar} />
                          <AvatarFallback>{<Loader />}</AvatarFallback>
                        </Avatar>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DottedSeparator className="py-4" />
            <div className="w-full flex items-center justify-between">
              <Button className="w-full" type="submit">
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardContent className="px-7 py-4"></CardContent>
    </Card>
  );
};
