import {
  onChatBotImageUpdate,
  onCreatedFilterQuestions,
  onCreateHelpDeskQuestion,
  onDeleteUserDomain,
  onGetAllFilterQuestions,
  onGetAllHelpDeskQuestions,
  onUpdateDomain,
  onUpdatePassword,
  onUpdateWelcomeMessage,
} from "@/actions/settings";
import { toast } from "sonner";
import {
  ChangePasswordProps,
  ChangePasswordSchema,
} from "@/schemas/auth.schema";
import {
  DomainSettingsProps,
  DomainSettingsSchema,
  FilterQuestionsProps,
  FilterQuestionsSchema,
  HelpDeskQuestionsProps,
  HelpDeskQuestionsScehma,
} from "@/schemas/settings.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { UploadClient } from "@uploadcare/upload-client";

const upload = new UploadClient({
  publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
});

export const useThemeMode = () => {
  const { setTheme, theme } = useTheme();

  return {
    setTheme,
    theme,
  };
};

export const useChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordProps>({
    // @ts-expect-error - Type compatibility issue between Zod and React Hook Form resolver
    resolver: zodResolver(ChangePasswordSchema),
    mode: "onChange",
  });

  //  const {toast} = useToast()
  const [loading, setLoading] = useState<boolean>(false);

  const onChangePassword = handleSubmit(async (values) => {
    try {
      setLoading(true);
      const updated = await onUpdatePassword(values.password);
      if (updated) {
        reset();
        setLoading(false);
        toast("Success", {
          description: updated.message,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  return {
    register,
    errors,
    onChangePassword,
    loading,
  };
};

export const useSettings = (id: string) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DomainSettingsProps>({
    resolver: zodResolver(DomainSettingsSchema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const onUpdateSettings = handleSubmit(async (values) => {
    setLoading(true);
    if (values.domain) {
      const domain = await onUpdateDomain(id, values.domain);
      if (domain) {
        toast("Success", {
          description: domain.message,
        });
      }
    }
    if (values.image && values.image[0]) {
      const uploaded = await upload.uploadFile(values.image[0]);
      const image = await onChatBotImageUpdate(id, uploaded.uuid);
      if (image) {
        toast(image.status == 200 ? "Success" : "Error", {
          description: image.message,
        });
        setLoading(false);
      }
    }
    if (values.welcomeMessage) {
      const message = await onUpdateWelcomeMessage(values.welcomeMessage, id);
      if (message) {
        toast("Success", {
          description: message.message,
        });
      }
    }
    reset();
    router.refresh();
    setLoading(false);
  });

  const onDeleteDomain = async () => {
    setDeleting(true);
    const deleted = await onDeleteUserDomain(id);
    if (deleted) {
      toast("Success", {
        description: deleted.message,
      });
      setDeleting(false);
      router.refresh();
    }
  };
  return {
    register,
    onUpdateSettings,
    errors,
    loading,
    onDeleteDomain,
    deleting,
  };
};

export const useHelpDesk = (id: string) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<HelpDeskQuestionsProps>({
    // @ts-expect-error - Type compatibility issue between Zod and React Hook Form resolver

    resolver: zodResolver(HelpDeskQuestionsScehma),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isQuestions, setIsQuestions] = useState<
    { id: string; question: string; answer: string }[]
  >([]);
  const onSubmitQuestion = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const question = await onCreateHelpDeskQuestion(
        id,
        values.question,
        values.answer
      );
      if (question) {
        // Fix: question.helpdesk is an array, get the last item
        if (question.question && Array.isArray(question.question)) {
          const newQuestion = question.question[question.question.length - 1];
          setIsQuestions((prev) => [
            ...prev,
            {
              id: newQuestion.id,
              question: newQuestion.question,
              answer: newQuestion.answered,
            },
          ]);
        }
        toast(question.status === 200 ? "Success" : "Error", {
          description: question.message,
        });
        reset();
      }
    } finally {
      setLoading(false);
    }
  });

  const onGetQuestions = useCallback(async () => {
    setLoading(true);
    const questions = await onGetAllHelpDeskQuestions(id);
    if (questions) {
      const mappedQuestions =
        questions.questions?.map((q) => ({
          id: q.id,
          question: q.question,
          answer: q.answered,
        })) || [];
      setIsQuestions(mappedQuestions);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    onGetQuestions();
  }, [onGetQuestions]);

  return {
    register,
    onSubmitQuestion,
    errors,
    isQuestions,
    loading,
  };
};

export const useFilterQuestions = (id: string) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FilterQuestionsProps>({
    resolver: zodResolver(FilterQuestionsSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isQuestions, setIsQuestions] = useState<
    {
      id: string;
      question: string;
      answered: string;
    }[]
  >([]);

  const onAddFilterQuestions = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const questions = await onCreatedFilterQuestions(
        id,
        values.question,
        values.answered
      );
      if (questions) {
        // Update the state with the new question
        if (questions.question && Array.isArray(questions.question)) {
          const newQuestion = questions.question[questions.question.length - 1];
          setIsQuestions((prev) => [
            ...prev,
            {
              id: newQuestion.id,
              question: newQuestion.question,
              answered: newQuestion.answered,
            },
          ]);
        }
        toast(questions.status === 200 ? "Success" : "Error", {
          description: questions.message,
        });
        reset();
      }
    } finally {
      setLoading(false);
    }
  });

  const onGetQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const questions = await onGetAllFilterQuestions(id);
      if (questions) {
        setIsQuestions(questions.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    onGetQuestions();
  }, [onGetQuestions]);

  return {
    loading,
    onAddFilterQuestions,
    register,
    errors,
    isQuestions,
  };
};
