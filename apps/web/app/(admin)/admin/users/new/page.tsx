import { UserForm } from "@/components/admin/UserForm";

export default function NewUserPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">ユーザー新規作成</h1>
      <UserForm />
    </div>
  );
}
