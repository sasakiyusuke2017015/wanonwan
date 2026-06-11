import { UserForm } from "@/components/admin/UserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">ユーザー編集</h1>
      <UserForm userId={id} />
    </div>
  );
}
