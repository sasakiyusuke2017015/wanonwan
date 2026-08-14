// merged PR のうち、内容が develop に届いていないものを洗い出す。
// 使い方: pnpm check:merges
//
// 「マージ先は常に develop」（.claude/rules/git-workflow.md）を破ると、親ブランチが先に
// develop へ出たあとに子 PR がマージされ、その作業がどこにも届かないまま宙づりになる。
// GitHub 上は MERGED と表示されるため、PR 一覧を眺めても気付けない。
import { execFileSync } from "node:child_process";

const LIMIT = Number(process.env.PR_LIMIT ?? 100);

const sh = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 28 }).trim();

let prs;
try {
  prs = JSON.parse(
    sh("gh", [
      "pr", "list", "--state", "merged", "--limit", String(LIMIT),
      "--json", "number,title,headRefName,baseRefName,mergeCommit",
    ]),
  );
} catch {
  console.error("✗ gh CLI で PR を取得できませんでした（認証 / ネットワークを確認）");
  process.exit(2);
}

sh("git", ["fetch", "origin", "--quiet"]);

// マージコミットが origin/develop の履歴に含まれるか。squash merge でも
// マージコミット自体は develop 上に作られるため、この判定で足りる。
const reachable = (sha) => {
  if (!sha) return false;
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", sha, "origin/develop"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const stranded = prs
  .filter((p) => p.baseRefName !== "develop")
  .filter((p) => !reachable(p.mergeCommit?.oid))
  .map((p) => ({ ...p, sha: (p.mergeCommit?.oid ?? "").slice(0, 8) }));

const offBase = prs.filter((p) => p.baseRefName !== "develop").length;
console.log(`merged PR ${prs.length} 件を検査（base が develop 以外: ${offBase} 件）`);

if (stranded.length === 0) {
  console.log("✓ 内容が develop に届いていない merged PR はありません");
  process.exit(0);
}

console.log(`\n⚠ マージコミットが develop に到達していない merged PR: ${stranded.length} 件`);
for (const p of stranded) {
  console.log(`  #${p.number} ${p.title}`);
  console.log(`    ${p.headRefName} → ${p.baseRefName}（sha ${p.sha}）`);
}
console.log(
  "\n内容を別コミットで救出済みなら想定内。心当たりが無ければ、その PR の作業は" +
    "\nどこにも届いていない。head ブランチから develop へ cherry-pick して入れ直すこと。" +
    "\nhead ブランチを消すと復元元が失われるので、解決するまで削除しない。",
);
process.exit(1);
