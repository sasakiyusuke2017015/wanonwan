"use client";

import { ContentBlock } from "@ui-catalog/core/organisms/ContentBlock";
import { InternalLink, AdjustmentBanner } from "@ui-catalog/core/molecules";
import { useNavigationItems } from "@/components/layout/useNavigationItems";

type HomeLink = {
  href: string;
  text: string;
  color: "primary" | "secondary" | "success" | "warning" | "danger";
};

// 旧 1on1 ホーム踏襲: ContentBlock のカードグリッド。
// 外部インフラリンク（旧サーバ / Pleasanter 等）は waoon に無関係なので持ち込まない。
const MAIN_LINKS: HomeLink[] = [
  { href: "/dashboard", text: "ダッシュボード", color: "secondary" },
  { href: "/surveys", text: "アンケートに回答", color: "success" },
  { href: "/schedule", text: "スケジュール", color: "primary" },
];

const ADMIN_LINKS: HomeLink[] = [
  { href: "/admin/users", text: "ユーザー管理", color: "primary" },
  { href: "/admin/surveys", text: "アンケート管理", color: "success" },
  { href: "/admin/answers", text: "回答・面談", color: "secondary" },
  { href: "/admin/org", text: "組織マスタ", color: "warning" },
  { href: "/admin/positions", text: "役職マスタ", color: "warning" },
];

function LinkButton({ link }: { link: HomeLink }) {
  return (
    <InternalLink
      href={link.href}
      variant="button"
      color={link.color}
      showIcon={false}
      className="block w-full justify-center text-center"
    >
      {link.text}
    </InternalLink>
  );
}

export default function Home() {
  const { me } = useNavigationItems();
  const isAdmin = me?.isAdmin ?? false;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AdjustmentBanner message={`ようこそ、${me?.name ?? "ゲスト"} さん。`} />

      <div className="grid grid-cols-1 gap-6 rounded-2xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8 shadow-xl backdrop-blur-sm md:grid-cols-2 lg:gap-8">
        <ContentBlock id="card-main" title="waoon" titleColor="text-indigo-700" titleAlign="center">
          <div className="space-y-3">
            {MAIN_LINKS.map((link) => (
              <LinkButton key={link.href} link={link} />
            ))}
          </div>
        </ContentBlock>

        {isAdmin && (
          <ContentBlock
            id="card-admin"
            title="管理"
            titleColor="text-rose-700"
            titleAlign="center"
            iconType="icon"
            iconName="gear"
          >
            <div className="space-y-3">
              {ADMIN_LINKS.map((link) => (
                <LinkButton key={link.href} link={link} />
              ))}
            </div>
          </ContentBlock>
        )}
      </div>
    </div>
  );
}
