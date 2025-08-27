"use client";

import { useFilterQuestions } from "@/hooks/settings/useSettings";
import React from "react";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";
import Section from "../SectionLabel";
import FormGenerator from "../forms/SignUp/formGenerator";
import { Button } from "../ui/button";
import { Loader } from "../loader";

type Props = {
  id: string;
};

const FilterQuestions = ({ id }: Props) => {
  const { register, errors, onAddFilterQuestions, isQuestions, loading } =
    useFilterQuestions(id);
  return (
    <Card className="w-full grid grid-cols-1 lg:grid-cols-2">
      <CardContent className="p-6 border-r-[1px]">
        <CardTitle>Help Desk</CardTitle>

        <form
          onSubmit={onAddFilterQuestions}
          className="flex flex-col gap-6 mt-10"
        >
          <div className="flex flex-col gap-3">
            <Section
              label="Question"
              message="Add a question that you want your chatbot to ask."
            />
            <FormGenerator
              inputType="input"
              register={register as any}
              errors={errors}
              form="filter-questions-form"
              placeholder="Type your question"
              type="text"
              name="question"
            />
          </div>

          <div className="flex flex-col gap-3">
            <Section
              label="Answer to Question"
              message="The answer for the question above"
            />
            <FormGenerator
              inputType="textarea"
              register={register as any}
              errors={errors}
              form="filter-questions-form"
              placeholder="Type your answer"
              type="text"
              name="answered"
              lines={5}
            />
          </div>
          <Button
            type="submit"
            className="bg-primary hover:opacity-90 cursor-pointer transition duration-150 ease-in-out text-white font-semibold"
          >
            Create
          </Button>
        </form>
      </CardContent>
      <CardContent>
        <Loader loading={loading}>
          {isQuestions.length ? (
            isQuestions.map((question) => (
              <div key={question.id} className="mb-4 p-3 border rounded">
                <p className="font-semibold">{question.question}</p>
              </div>
            ))
          ) : (
            <CardDescription>NO Questions</CardDescription>
          )}
        </Loader>
      </CardContent>
    </Card>
  );
};
export default FilterQuestions;
