import Link from "next/link";

// 組織マスタのハブ。本部 / 部 / 課の各管理へ誘導する。
const LINKS = [
  { href: "/admin/org/divisions", title: "本部", desc: "本部（division）の一覧・作成・編集" },
  { href: "/admin/org/departments", title: "部", desc: "部（department）の一覧・作成・編集" },
  { href: "/admin/org/sections", title: "課", desc: "課（section）の一覧・作成・編集" },
];

export default function OrgHubPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">組織マスタ</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded border border-gray-200 p-4 hover:bg-gray-50"
          >
            <div className="text-lg font-semibold">{l.title}</div>
            <div className="mt-1 text-sm text-gray-600">{l.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
