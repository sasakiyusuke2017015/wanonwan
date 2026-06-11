import { SurveyForm } from "@/components/admin/SurveyForm";

export default async function EditSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">アンケート編集</h1>
      <SurveyForm surveyId={id} />
    </div>
  );
}
