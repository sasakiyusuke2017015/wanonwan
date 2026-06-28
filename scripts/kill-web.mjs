// dev の web (next dev) を止める。compose:dev:down に同梱して「down で web も消える」を満たす。
// web は Docker コンテナではなく node プロセスなので docker compose down では落ちない。そのため
// web ポート(既定 3000)を LISTEN しているプロセスを特定して終了する。
//
// ポートを掴むプロセスを無条件で落とすので、3000 を別アプリが使っている場合もそれを止める
// （dev の web ポートを空ける、という割り切り）。ポートは WEB_PORT / PORT で上書き可。
import { execFileSync } from "node:child_process";

const port = Number(process.env.WEB_PORT || process.env.PORT || 3000);

// 指定ポートを LISTEN している PID 群を返す。ツール非存在 / 未 LISTEN は空集合（throw しない）。
function listeningPids(port) {
  const pids = new Set();
  try {
    if (process.platform === "win32") {
      // 例: "  TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345"
      const out = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
      for (const line of out.split(/\r?\n/)) {
        const m = line.match(/:(\d+)\s+\S+\s+LISTENING\s+(\d+)/i);
        if (m && Number(m[1]) === port) pids.add(m[2]);
      }
    } else {
      try {
        // darwin / linux: lsof があれば最優先（terse PID 出力）
        const out = execFileSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], { encoding: "utf8" });
        for (const p of out.split(/\s+/).filter(Boolean)) pids.add(p);
      } catch {
        // linux fallback: ss (iproute2)。出力の users:(("next-server",pid=12345,fd=20)) から拾う
        const out = execFileSync("ss", ["-ltnpH", `sport = :${port}`], { encoding: "utf8" });
        for (const m of out.matchAll(/pid=(\d+)/g)) pids.add(m[1]);
      }
    }
  } catch {
    // netstat / lsof / ss いずれも無い、または何も LISTEN していない → 空集合
  }
  return [...pids];
}

function killPid(pid) {
  try {
    if (process.platform === "win32") {
      execFileSync("taskkill", ["/PID", pid, "/F", "/T"], { stdio: "ignore" });
    } else {
      process.kill(Number(pid), "SIGTERM");
    }
    return true;
  } catch {
    return false;
  }
}

const pids = listeningPids(port);
if (pids.length === 0) {
  console.log(`• web (port ${port}) は起動していない`);
} else {
  for (const pid of pids) {
    if (killPid(pid)) console.log(`• web を停止 (port ${port}, PID ${pid})`);
    else console.log(`✗ PID ${pid} を停止できなかった（手動で kill ${pid}）`);
  }
}
