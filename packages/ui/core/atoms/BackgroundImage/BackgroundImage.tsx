import styles from './SpaceBackground.module.scss';

interface FloatingElement {
  position: string;
  size: string;
  gradient: string;
  blur: string;
  animationDelay?: string;
}

type BackgroundVariant = 'image' | 'space';

interface BackgroundImageProps {
  /** variant='image' のときは必須。variant='space' のときは無視される */
  src?: string;
  variant?: BackgroundVariant;
  opacity?: number;
  position?: string;
  size?: string;
  repeat?: string;
  showFloatingElements?: boolean;
  floatingElements?: FloatingElement[];
  /** space variant の星の密度 (最前面の層の個数) */
  starCount?: number;
}

const defaultFloatingElements: FloatingElement[] = [
  {
    position: 'top-0 left-1/4',
    size: 'w-96 h-96',
    gradient: 'from-purple-400/10 to-pink-400/15',
    blur: 'blur-3xl',
  },
  {
    position: 'bottom-0 right-1/4',
    size: 'w-80 h-80',
    gradient: 'from-blue-400/12 to-cyan-400/20',
    blur: 'blur-3xl',
    animationDelay: '2s',
  },
  {
    position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
    size: 'w-72 h-72',
    gradient: 'from-indigo-400/8 to-violet-400/15',
    blur: 'blur-2xl',
    animationDelay: '1s',
  },
  {
    position: 'top-1/4 right-1/3',
    size: 'w-64 h-64',
    gradient: 'from-rose-400/10 to-orange-400/12',
    blur: 'blur-2xl',
    animationDelay: '3s',
  },
  {
    position: 'bottom-1/3 left-1/6',
    size: 'w-88 h-88',
    gradient: 'from-teal-400/8 to-emerald-400/15',
    blur: 'blur-2xl',
    animationDelay: '1.5s',
  },
];

// 決定的な擬似乱数 (mulberry32)。Math.random を使わず seed から生成するので
// SSR / CSR で星配置が一致し、hydration ミスマッチを起こさない。
function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface StarStyle {
  top: string;
  left: string;
  size: string;
  duration: string;
  delay: string;
}

function buildStars(count: number, seed: number): StarStyle[] {
  const rng = makeRng(seed);
  return Array.from({ length: count }, () => {
    const px = (0.8 + rng() * 1.8).toFixed(2);
    return {
      top: `${(rng() * 100).toFixed(2)}%`,
      left: `${(rng() * 100).toFixed(2)}%`,
      size: `${px}px`,
      duration: `${(2.5 + rng() * 4).toFixed(2)}s`,
      delay: `${(rng() * 5).toFixed(2)}s`,
    };
  });
}

interface MeteorStyle {
  top: string;
  left: string;
  duration: string;
  delay: string;
  /** 進行方向の角度 (deg)。0 = 右、90 = 下。20〜100 に制限 (右下方向のみ)。 */
  angle: number;
  /** 尾の長さ (px) */
  tail: number;
  /** 頭・尾の色相 (deg) */
  hue: number;
  /** 0..1。大きいほど太く明るい流星 */
  scale: number;
  /** 先端スパークルの脈動周期 (s)。流星ごとにばらして同期を避ける */
  sparkDur: number;
}

// 流星も seed 乱数で生成 (Math.random は SSR/CSR でズレるため不可)。
// 位置・タイミング・色 (hue) はばらすが、方向 (angle) は 20〜100 度に制限し、
// 右下方向へ降る自然な流星のみにする (真横・上向きは出さない)。
//
// 飛距離は指定せず、CSS 側で 160vmax (= 必ず画面を突き抜ける固定長) を進ませる。
// 速さは vmax/秒 の範囲で直接指定し、飛行時間 = 飛距離 / 速さ で算出する。
// 飛行は周期の最初 2% (= デューティ比) だけで、残り 98% は待機。
//   周期 = 飛行時間 / 0.02。同時表示数 ≒ 本数 × 0.02。
// プール本数を大きく取り、各本のデューティ比を小さくすることで
// 「同時表示は数本・軌道は毎回違う = 繰り返しに見えない」状態にする。
const METEOR_TRAVEL_VMAX = 160;
const METEOR_FLIGHT_FRACTION = 0.02; // CSS @keyframes meteorFly の飛行 2% と一致させる

const METEOR_ANGLE_MIN = 20; // 度
const METEOR_ANGLE_MAX = 100; // 度

function buildMeteors(count: number, seed: number): MeteorStyle[] {
  const rng = makeRng(seed);
  // 角度は範囲 (20〜100) を本数で等分し、各区画内でランダムに 1 本ずつ置く。
  // 純粋乱数だと少数本では値が固まり「方向が一定」に見えるため、区画で散らす。
  const angleBand = (METEOR_ANGLE_MAX - METEOR_ANGLE_MIN) / count;
  return Array.from({ length: count }, (_, i) => {
    const speed = 10 + rng() * 15; // 10〜25 vmax/秒 (速さを範囲で直接指定)
    const flightSec = METEOR_TRAVEL_VMAX / speed; // 実飛行時間 (約 3.2〜8s)
    const cycleSec = flightSec / METEOR_FLIGHT_FRACTION; // 周期 (飛行3% + 待機97%)
    return {
      top: `${(rng() * 80 - 10).toFixed(2)}%`,
      left: `${(rng() * 100).toFixed(2)}%`,
      duration: `${cycleSec.toFixed(2)}s`,
      // 負の遅延で各本の位相をばらし、初手から定常状態 (常時数本が流れている) にする
      delay: `${(-rng() * cycleSec).toFixed(2)}s`,
      // i 番目の区画 [min + i*band, min + (i+1)*band) 内でランダム → 必ず方向が散る
      angle: Math.round(METEOR_ANGLE_MIN + (i + rng()) * angleBand),
      tail: Math.round(120 + rng() * 160), // 120〜280px
      hue: Math.round(rng() * 360), // 虹色
      scale: Number((0.7 + rng() * 0.9).toFixed(2)), // 0.7〜1.6
      sparkDur: Number((0.8 + rng() * 0.8).toFixed(2)), // 0.8〜1.6s
    };
  });
}

// 弧を描いて飛ぶ流星 (蛇のように尾が頭の軌道をなぞる)。
// SVG の二次ベジェ曲線パスを 1 本作り、その上を「ひとつながりの帯」が dash で滑る。
// 帯はパスの一部なので、尾は必ず頭が通った曲線をなぞる (剛体の直線尾にならない)。
// 座標系は COMET_VIEW (viewBox)。preserveAspectRatio="slice" で全面を覆い、歪ませない。
interface CometStyle {
  /** SVG パス (M sx sy Q cx cy ex ey) */
  d: string;
  /** パスの概算弧長 (各レイヤの dash 走行範囲はこれから算出) */
  length: number;
  duration: string;
  delay: string;
  hue: number;
}

const COMET_VIEW_W = 1600;
const COMET_VIEW_H = 900;

// コメットの「飛行時間 / 周期」。小さいほど周期 (繰り返し間隔) が長く、出現がレアになる。
// 飛行の速さ・本数 (20) は変えず、待ち時間だけ伸びる。同時表示数 ≒ プール本数 × この値。
// 0.02 × 20 本 ≒ 常時 0.4 本 (たまにスッと 1 本)。CSS の飛行窓 2% と一致させること。
const COMET_FLIGHT_FRACTION = 0.02;

// 彗星の尾/胴を作る重ね帯。頭 (= 先端) を共有しつつ後方へ違う長さで伸ばす。
// seg が短い層ほど頭付近にだけ濃く乗り、長い層が細く淡い尾を作る = 楔形のテーパー。
// 頭 (核) は帯では作らず、別途 offset-path で走る放射グラデの円で作る (下記 render)。
// kind: 'body'=尾/胴 (淡い虹色) / 'core'=頭寄りの明るい胴。
const COMET_LAYERS = [
  { seg: 120, width: 7.5, strokeOpacity: 0.18, blur: 3, kind: 'body' }, // 頭まわりのハロー
  { seg: 360, width: 1.3, strokeOpacity: 0.28, blur: 0, kind: 'body' }, // 細く長い尾
  { seg: 180, width: 2.4, strokeOpacity: 0.55, blur: 0, kind: 'body' }, // 中間の胴
  { seg: 60, width: 3.2, strokeOpacity: 0.95, blur: 0, kind: 'core' }, // 頭の首 (明るい胴)
];

// 二次ベジェ B(t) = (1-t)^2 P0 + 2(1-t)t C + t^2 P1 をサンプリングして弧長を概算。
function quadLength(
  p0: [number, number],
  c: [number, number],
  p1: [number, number],
): number {
  const steps = 24;
  let len = 0;
  let prev = p0;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const mt = 1 - t;
    const x = mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p1[0];
    const y = mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p1[1];
    len += Math.hypot(x - prev[0], y - prev[1]);
    prev = [x, y];
  }
  return len;
}

function buildComets(count: number, seed: number): CometStyle[] {
  const rng = makeRng(seed);
  const angleBand = (METEOR_ANGLE_MAX - METEOR_ANGLE_MIN) / count;
  return Array.from({ length: count }, (_, i) => {
    // 進行方向 (0=右, 90=下)。直進流星と同じ 20〜100 度帯を等分。
    const angle = METEOR_ANGLE_MIN + (i + rng()) * angleBand;
    const rad = (angle * Math.PI) / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);
    // 始点は上端まわりからばらつかせ、画面を必ず突き抜ける長さだけ進める。
    const sx = rng() * COMET_VIEW_W;
    const sy = rng() * COMET_VIEW_H * 0.5 - COMET_VIEW_H * 0.15;
    const travel = COMET_VIEW_W * 1.6;
    const ex = sx + ux * travel;
    const ey = sy + uy * travel;
    // 制御点を弦の中点から垂直にずらして弧を作る (左右の膨らみは seed で決定)。
    const side = rng() < 0.5 ? 1 : -1;
    const px = -uy * side;
    const py = ux * side;
    const bow = travel * (0.12 + rng() * 0.16); // 弦長の 12〜28% 膨らませる
    const cx = (sx + ex) / 2 + px * bow;
    const cy = (sy + ey) / 2 + py * bow;
    const length = quadLength([sx, sy], [cx, cy], [ex, ey]);
    const speed = 350 + rng() * 350; // user-units/秒
    const flightSec = length / speed;
    const cycleSec = flightSec / COMET_FLIGHT_FRACTION; // 飛行 30% + 待機 70%
    return {
      d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      length: Math.round(length),
      duration: `${cycleSec.toFixed(2)}s`,
      delay: `${(-rng() * cycleSec).toFixed(2)}s`,
      hue: Math.round(rng() * 360),
    };
  });
}

interface OrbitArcStyle {
  top?: string;
  bottom?: string;
  left?: string;
  size: string;
  hue: number;
  /** 円弧の長さ (deg) */
  arc: string;
  /** 円弧の開始角 (deg) */
  from: string;
  /** 1 周の時間 (s) */
  dur: string;
  opacity: number;
}

// 光の弧 (周回するオービット)。各弧は「中心 (cTop/cBottom, cLeft)・色・弧長・速さ」を
// 固定で持ち、半径 (size) だけ seed 乱数で散らす。中心を保つため
// top/left/bottom = 中心 - size/2 で算出する (size が変わっても見える位置が動かない)。
interface OrbitArcBase {
  cTop?: string;
  cBottom?: string;
  cLeft: string;
  hue: number;
  arc: string;
  from: string;
  dur: string;
  opacity: number;
}

const ORBIT_SIZE_MIN = 75; // rem
const ORBIT_SIZE_MAX = 225; // rem

// リング帯の中心半径 (container 幅に対する %)。SCSS の mask (ellipse 50% 50% の
// 98〜100% 帯 → 中心 49.5%) と必ず一致させること。頭の玉をこの半径に置いて線に乗せる。
const ORBIT_RING_RADIUS_PCT = 49.5;

const ORBIT_BASES: OrbitArcBase[] = [
  { cTop: '4%', cLeft: '40%', hue: 268, arc: '82deg', from: '12deg', dur: '44s', opacity: 0.78 },
  { cBottom: '2%', cLeft: '2%', hue: 192, arc: '64deg', from: '205deg', dur: '72s', opacity: 0.72 },
  { cTop: '50%', cLeft: '82%', hue: 332, arc: '72deg', from: '120deg', dur: '104s', opacity: 0.68 },
];

function buildOrbitArcs(seed: number): OrbitArcStyle[] {
  const rng = makeRng(seed);
  return ORBIT_BASES.map((b) => {
    // 半径 90〜250rem を seed 乱数で。
    const sizeRem = Math.round(
      ORBIT_SIZE_MIN + rng() * (ORBIT_SIZE_MAX - ORBIT_SIZE_MIN),
    );
    const half = sizeRem / 2;
    return {
      top: b.cTop ? `calc(${b.cTop} - ${half}rem)` : undefined,
      bottom: b.cBottom ? `calc(${b.cBottom} - ${half}rem)` : undefined,
      left: `calc(${b.cLeft} - ${half}rem)`,
      size: `${sizeRem}rem`,
      hue: b.hue,
      arc: b.arc,
      from: b.from,
      dur: b.dur,
      opacity: b.opacity,
    };
  });
}

const orbitArcs = buildOrbitArcs(23);

const SpaceBackground = ({ starCount = 60 }: { starCount?: number }) => {
  const near = buildStars(starCount, 1);
  const mid = buildStars(Math.round(starCount * 0.8), 2);
  const far = buildStars(Math.round(starCount * 0.6), 3);
  // 30 本プール × デューティ比 2% → 同時表示は平均 0.6 本 (流れない間もある)。
  // 軌道が 30 通りあるため繰り返しに見えない。
  const meteors = buildMeteors(30, 7);
  // 弧を描く流星 (蛇トレイル) は別プール。直進流星と混ざって変化を出す。
  const comets = buildComets(20, 13);

  const renderLayer = (stars: StarStyle[], layerClass: string) => (
    <div className={`${styles.stars} ${layerClass}`}>
      {stars.map((s, i) => (
        <span
          key={i}
          className={styles.star}
          style={
            {
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              '--tw-dur': s.duration,
              '--tw-delay': s.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );

  return (
    <div className={styles.root} data-variant="space" aria-hidden="true">
      <div className={`${styles.nebula} ${styles.nebulaViolet}`} />
      <div className={`${styles.nebula} ${styles.nebulaCyan}`} />
      <div className={`${styles.nebula} ${styles.nebulaMagenta}`} />

      {orbitArcs.map((o, i) => {
        // 弧の明るい端 = conic の from + arc (0deg=真上, 時計回り)。ただし端ちょうどだと
        // 線が消えていく所で玉が片側にはみ出すので、5deg 内側に寄せて線の上に乗せる。
        // リングは container 半径の約 70% (= 全体の約 49.5%) に乗る。
        const tip = ((parseFloat(o.from) + parseFloat(o.arc) - 5) * Math.PI) / 180;
        const headLeft = 50 + ORBIT_RING_RADIUS_PCT * Math.sin(tip);
        const headTop = 50 - ORBIT_RING_RADIUS_PCT * Math.cos(tip);
        // 頭の径は弧の size に比例。リング線の太さに近づけてはみ出しを抑える。
        const headSize = (parseFloat(o.size) * 0.02).toFixed(2);
        // きらりの周期・位相を弧ごとにずらす (揃って光らないように)。
        const glintDur = 9 + i * 2.5; // 9 / 11.5 / 14s
        const glintDelay = -(2 + i * 3.5); // -2 / -5.5 / -9s
        return (
          <div
            key={i}
            className={styles.orbitArc}
            style={
              {
                top: o.top,
                bottom: o.bottom,
                left: o.left,
                width: o.size,
                height: o.size,
                '--oa-hue': `${o.hue}`,
                '--oa-arc': o.arc,
                '--oa-from': o.from,
                '--oa-dur': o.dur,
                '--oa-head-left': `${headLeft.toFixed(2)}%`,
                '--oa-head-top': `${headTop.toFixed(2)}%`,
                '--oa-head-size': `${headSize}rem`,
                '--oa-glint-dur': `${glintDur}s`,
                '--oa-glint-delay': `${glintDelay}s`,
              } as React.CSSProperties
            }
          >
            <div
              className={styles.orbitRing}
              style={{ opacity: o.opacity } as React.CSSProperties}
            />
            <span className={styles.orbitHead} />
          </div>
        );
      })}

      {renderLayer(far, styles.starsFar)}
      {renderLayer(mid, styles.starsMid)}
      {renderLayer(near, styles.starsNear)}

      {meteors.map((m, i) => {
        // 進行方向の単位ベクトル (angle: 0=右, 90=下)。
        // 飛距離は CSS の --m-len (160vmax) と掛けて画面外まで突き抜けさせる。
        const rad = (m.angle * Math.PI) / 180;
        const ux = Math.cos(rad);
        const uy = Math.sin(rad);
        // 尾は進行方向の後方 (= angle + 180) に伸ばす。
        // 尾はローカル X+ 方向に出るので、要素を angle+180 だけ回す。
        const tailRotate = m.angle + 180;
        return (
          <span
            key={i}
            className={styles.meteor}
            style={
              {
                '--m-top': m.top,
                '--m-left': m.left,
                '--m-dur': m.duration,
                '--m-delay': m.delay,
                '--m-ux': `${ux.toFixed(4)}`,
                '--m-uy': `${uy.toFixed(4)}`,
                '--m-rot': `${tailRotate}deg`,
                '--m-tail': `${m.tail}px`,
                '--m-hue': `${m.hue}`,
                '--m-scale': `${m.scale}`,
                '--m-spark-dur': `${m.sparkDur}s`,
              } as React.CSSProperties
            }
          >
            <span className={styles.meteorBody}>
              <span className={styles.meteorTail} />
              <span className={styles.meteorHead} />
              <span className={styles.meteorSparkle} />
            </span>
          </span>
        );
      })}

      <svg
        className={styles.cometSvg}
        viewBox={`0 0 ${COMET_VIEW_W} ${COMET_VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {comets.map((c, i) => (
          <g
            key={i}
            style={
              {
                '--c-dur': c.duration,
                '--c-delay': c.delay,
                '--c-hue': `${c.hue}`,
              } as React.CSSProperties
            }
          >
            {COMET_LAYERS.map((ly, j) => (
              // 各層は「頭の先端」を共有 (from=seg → to=seg-length) し、
              // seg の長さだけ後方へ伸びる。短い層=頭付近に濃く、長い層=細い尾。
              <path
                key={j}
                className={styles.cometSeg}
                d={c.d}
                style={
                  {
                    '--c-seg': `${ly.seg}`,
                    '--c-gap': `${c.length + ly.seg + 40}`,
                    '--c-from': `${ly.seg}`,
                    '--c-to': `${ly.seg - c.length}`,
                    strokeWidth: ly.width,
                    strokeOpacity: ly.strokeOpacity,
                    stroke:
                      ly.kind === 'core'
                        ? `hsl(${c.hue} 100% 90%)`
                        : `hsl(${c.hue} 95% 70%)`,
                    filter: ly.blur ? `blur(${ly.blur}px)` : undefined,
                  } as React.CSSProperties
                }
              />
            ))}
            {/* 頭 (火の玉)。offset-path で曲線の先端 (帯と同じ進行) に同期して走るグループ。
                ハロー + 白熱の核 (フリッカー) + 回転する十字光芒。 */}
            <g
              className={styles.cometHead}
              style={{ offsetPath: `path('${c.d}')` } as React.CSSProperties}
            >
              <circle className={styles.cometHeadGlow} r={13} />
              <circle className={styles.cometHeadCore} r={4} />
              <path
                className={styles.cometSparkle}
                d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z"
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const BackgroundImage = ({
  src,
  variant = 'image',
  opacity = 60,
  position = 'center',
  size = 'cover',
  repeat = 'no-repeat',
  showFloatingElements = false,
  floatingElements = defaultFloatingElements,
  starCount,
}: BackgroundImageProps) => {
  if (variant === 'space') {
    return (
      <div data-component="background-image">
        <SpaceBackground starCount={starCount} />
      </div>
    );
  }

  return (
    <div data-component="background-image">
      {/* 背景画像 */}
      <div
        className={`absolute inset-0 opacity-${opacity}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: size,
          backgroundPosition: position,
          backgroundRepeat: repeat,
        }}
      />

      {/* フローティング要素 */}
      {showFloatingElements &&
        floatingElements.map((element, index) => (
          <div
            key={index}
            className={`absolute ${element.position} ${element.size} bg-gradient-to-r ${element.gradient} rounded-full ${element.blur} animate-pulse`}
            style={
              element.animationDelay
                ? { animationDelay: element.animationDelay }
                : undefined
            }
          />
        ))}
    </div>
  );
};
