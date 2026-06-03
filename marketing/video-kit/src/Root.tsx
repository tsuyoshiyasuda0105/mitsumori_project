import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const FPS = 30;
const DURATION_IN_FRAMES = 450;

const colors = {
  bg: "#07111f",
  ink: "#f8fafc",
  muted: "#cbd5e1",
  cyan: "#67e8f9",
  blue: "#6366f1",
  green: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
  panel: "rgba(255,255,255,0.94)",
  panelDark: "rgba(15,23,42,0.86)",
  line: "rgba(148,163,184,0.22)",
};

type SceneProps = {
  from: number;
  duration: number;
};

function fade(frame: number, from: number, duration: number) {
  return interpolate(frame, [from, from + 18, from + duration - 18, from + duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideY(frame: number, from: number, amount = 50) {
  return interpolate(frame, [from, from + 24], [amount, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function Background() {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, DURATION_IN_FRAMES], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 72% 14%, rgba(103,232,249,0.23), transparent 30%), radial-gradient(circle at 16% 72%, rgba(52,211,153,0.18), transparent 32%), linear-gradient(145deg, #07111f 0%, #101a30 54%, #0b1020 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -80,
          opacity: 0.22,
          transform: `translateY(${drift}px) rotate(-10deg)`,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -170,
          top: 130,
          width: 620,
          height: 620,
          borderRadius: 999,
          background: "rgba(99,102,241,0.22)",
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -190,
          bottom: 260,
          width: 640,
          height: 640,
          borderRadius: 999,
          background: "rgba(20,184,166,0.17)",
          filter: "blur(100px)",
        }}
      />
    </AbsoluteFill>
  );
}

function BrandBar() {
  return (
    <div
      style={{
        position: "absolute",
        left: 68,
        right: 68,
        top: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: colors.ink,
        fontFamily: "Yu Gothic, Meiryo, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            fontWeight: 900,
          }}
        >
          V
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 0 }}>ボイス見積</div>
          <div style={{ marginTop: 4, fontSize: 18, color: colors.muted }}>音声AI見積作成システム</div>
        </div>
      </div>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 999,
          padding: "14px 22px",
          fontSize: 18,
          color: "#dbeafe",
          background: "rgba(15,23,42,0.35)",
        }}
      >
        先行デモ公開中
      </div>
    </div>
  );
}

function TitleBlock({ from, duration }: SceneProps) {
  const frame = useCurrentFrame();
  const opacity = fade(frame, from, duration);
  const y = slideY(frame, from, 70);

  return (
    <div
      style={{
        position: "absolute",
        left: 68,
        right: 68,
        top: 205 + y,
        opacity,
        fontFamily: "Yu Gothic, Meiryo, sans-serif",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          border: "1px solid rgba(255,255,255,0.22)",
          borderRadius: 999,
          padding: "12px 20px",
          color: colors.cyan,
          fontSize: 22,
          fontWeight: 800,
          background: "rgba(15,23,42,0.48)",
        }}
      >
        現場で話すだけ
      </div>
      <div
        style={{
          marginTop: 28,
          color: colors.ink,
          fontSize: 78,
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        見積もりを
        <br />
        作るの、
        <br />
        あと回しに
        <br />
        なっていませんか。
      </div>
      <div style={{ marginTop: 28, color: "#dbeafe", fontSize: 31, lineHeight: 1.6, fontWeight: 700 }}>
        音声から明細候補を作り、
        <br />
        単価マスターで価格をそろえます。
      </div>
    </div>
  );
}

function VoicePhone({ from, duration }: SceneProps) {
  const frame = useCurrentFrame();
  const opacity = fade(frame, from, duration);
  const entrance = spring({ frame: frame - from, fps: FPS, config: { damping: 18, mass: 0.8 } });
  const scale = interpolate(entrance, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 176,
        right: 176,
        bottom: 192,
        height: 760,
        opacity,
        transform: `scale(${scale})`,
        borderRadius: 58,
        background: colors.panel,
        border: "12px solid rgba(15,23,42,0.72)",
        boxShadow: "0 34px 90px rgba(0,0,0,0.42)",
        fontFamily: "Yu Gothic, Meiryo, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 38,
          right: 38,
          top: 40,
          display: "flex",
          justifyContent: "space-between",
          color: "#0f172a",
          fontSize: 25,
          fontWeight: 900,
        }}
      >
        <span>録音中</span>
        <span style={{ color: colors.rose }}>●</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 220,
          width: 220,
          height: 220,
          marginLeft: -110,
          borderRadius: 999,
          background: "linear-gradient(135deg, #e11d48, #fb7185)",
          boxShadow: "0 22px 60px rgba(225,29,72,0.34)",
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: 66,
          fontWeight: 900,
        }}
      >
        声
      </div>
      <Waveform from={from + 18} top={510} />
      <div
        style={{
          position: "absolute",
          left: 46,
          right: 46,
          bottom: 52,
          borderRadius: 22,
          background: "#eef2ff",
          color: "#4338ca",
          padding: "24px 28px",
          fontSize: 28,
          lineHeight: 1.45,
          fontWeight: 800,
        }}
      >
        「外壁シリコン塗装、180㎡」
        <br />
        AIが明細候補を作成
      </div>
    </div>
  );
}

function Waveform({ from, top }: { from: number; top: number }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 92,
        right: 92,
        top,
        height: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
      }}
    >
      {Array.from({ length: 18 }).map((_, i) => {
        const pulse = Math.sin((frame - from) / 5 + i * 0.72);
        const h = 28 + Math.max(0, pulse) * 78;
        return (
          <div
            key={i}
            style={{
              width: 12,
              height: h,
              borderRadius: 99,
              background: i % 2 === 0 ? colors.blue : colors.cyan,
            }}
          />
        );
      })}
    </div>
  );
}

function EstimateScene({ from, duration }: SceneProps) {
  const frame = useCurrentFrame();
  const opacity = fade(frame, from, duration);
  const y = slideY(frame, from, 60);

  return (
    <div style={{ position: "absolute", inset: 0, opacity, fontFamily: "Yu Gothic, Meiryo, sans-serif" }}>
      <SceneHeadline
        from={from}
        badge="AIが下書き"
        title="話した内容から、見積明細へ。"
        color={colors.cyan}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 70,
          top: 520 + y,
          borderRadius: 34,
          background: colors.panel,
          boxShadow: "0 34px 90px rgba(0,0,0,0.36)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 98,
            background: "#111827",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 38px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 31, fontWeight: 900 }}>見積編集</span>
          <span style={{ fontSize: 22, color: "#bfdbfe" }}>外壁塗装 A様邸</span>
        </div>
        <div style={{ padding: "26px 28px 34px" }}>
          <TableHeader />
          {[
            ["外壁", "シリコン塗装", "180㎡", "432,000"],
            ["足場", "くさび式足場", "210㎡", "189,000"],
            ["屋根", "高圧洗浄", "95㎡", "42,750"],
          ].map((row, i) => (
            <AnimatedRow key={row[1]} row={row} index={i} from={from + 22 + i * 14} />
          ))}
          <div
            style={{
              marginTop: 24,
              borderRadius: 20,
              background: "#fff7ed",
              border: "2px solid #fed7aa",
              color: "#9a3412",
              padding: "20px 24px",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            業者指示事項はExcel出力へ分けて管理
          </div>
        </div>
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.7fr 1fr 1fr",
        color: "#64748b",
        fontSize: 19,
        fontWeight: 900,
        padding: "0 22px 12px",
      }}
    >
      <span>場所</span>
      <span>品目</span>
      <span>数量</span>
      <span>金額</span>
    </div>
  );
}

function AnimatedRow({ row, index, from }: { row: string[]; index: number; from: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, from + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(frame, [from, from + 16], [36, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${x}px)`,
        display: "grid",
        gridTemplateColumns: "1fr 1.7fr 1fr 1fr",
        alignItems: "center",
        marginTop: 12,
        minHeight: 82,
        borderRadius: 19,
        background: index === 0 ? "#eef2ff" : "white",
        border: `2px solid ${index === 0 ? "#c7d2fe" : "#e2e8f0"}`,
        color: "#0f172a",
        padding: "0 22px",
        fontSize: 25,
        fontWeight: 800,
      }}
    >
      <span>{row[0]}</span>
      <span>{row[1]}</span>
      <span>{row[2]}</span>
      <span>{row[3]}</span>
    </div>
  );
}

function MasterScene({ from, duration }: SceneProps) {
  const frame = useCurrentFrame();
  const opacity = fade(frame, from, duration);
  const match = interpolate(frame, [from + 28, from + 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, opacity, fontFamily: "Yu Gothic, Meiryo, sans-serif" }}>
      <SceneHeadline
        from={from}
        badge="価格を統一"
        title="単価マスターと自動照合。"
        color={colors.green}
      />
      <div
        style={{
          position: "absolute",
          left: 78,
          right: 78,
          top: 565,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 26,
        }}
      >
        <PricePanel title="音声からの候補" rows={["シリコン塗装", "180㎡", "外壁"]} accent={colors.cyan} />
        <PricePanel title="単価マスター" rows={["シリコン塗装", "単位: ㎡", "単価: 2,400円"]} accent={colors.green} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 138,
          right: 138,
          top: 1120,
          borderRadius: 28,
          background: `rgba(52,211,153,${0.18 + match * 0.52})`,
          border: "3px solid rgba(52,211,153,0.88)",
          color: "#ecfeff",
          padding: "32px 38px",
          fontSize: 34,
          fontWeight: 900,
          textAlign: "center",
          transform: `scale(${0.94 + match * 0.06})`,
        }}
      >
        品目・単位・単価をそろえて、価格ブレを抑える
      </div>
    </div>
  );
}

function PricePanel({ title, rows, accent }: { title: string; rows: string[]; accent: string }) {
  return (
    <div
      style={{
        borderRadius: 30,
        background: colors.panel,
        padding: "34px 30px",
        boxShadow: "0 28px 74px rgba(0,0,0,0.28)",
        minHeight: 390,
      }}
    >
      <div style={{ color: accent, fontSize: 26, fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 26, display: "grid", gap: 18 }}>
        {rows.map((row) => (
          <div
            key={row}
            style={{
              borderRadius: 18,
              border: "2px solid #e2e8f0",
              padding: "22px 20px",
              color: "#0f172a",
              fontSize: 27,
              fontWeight: 850,
              background: "#ffffff",
            }}
          >
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportScene({ from, duration }: SceneProps) {
  const frame = useCurrentFrame();
  const opacity = fade(frame, from, duration);

  return (
    <div style={{ position: "absolute", inset: 0, opacity, fontFamily: "Yu Gothic, Meiryo, sans-serif" }}>
      <SceneHeadline
        from={from}
        badge="データ活用"
        title="Excelにも、他システムにも。"
        color="#bfdbfe"
      />
      <div
        style={{
          position: "absolute",
          left: 92,
          right: 92,
          top: 600,
          display: "grid",
          gap: 28,
        }}
      >
        {[
          ["Excel出力", "明細・業者指示事項を出力"],
          ["CSV連携", "外部IDつきで変換しやすく"],
          ["見積PDF", "顧客向けの見積書を作成"],
        ].map((item, i) => {
          const start = from + 24 + i * 18;
          const rowOpacity = interpolate(frame, [start, start + 18], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const x = interpolate(frame, [start, start + 18], [50, 0], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={item[0]}
              style={{
                opacity: rowOpacity,
                transform: `translateX(${x}px)`,
                minHeight: 158,
                borderRadius: 28,
                background: "rgba(255,255,255,0.94)",
                display: "grid",
                gridTemplateColumns: "118px 1fr",
                alignItems: "center",
                gap: 28,
                padding: "28px 34px",
                boxShadow: "0 26px 70px rgba(0,0,0,0.28)",
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 24,
                  background: i === 0 ? "#dcfce7" : i === 1 ? "#dbeafe" : "#ede9fe",
                  color: i === 0 ? "#166534" : i === 1 ? "#1d4ed8" : "#5b21b6",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 34,
                  fontWeight: 900,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ color: "#0f172a", fontSize: 34, fontWeight: 900 }}>{item[0]}</div>
                <div style={{ marginTop: 8, color: "#475569", fontSize: 25, fontWeight: 700 }}>{item[1]}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          bottom: 138,
          borderRadius: 28,
          background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
          color: "white",
          padding: "36px 44px",
          fontSize: 40,
          lineHeight: 1.28,
          fontWeight: 900,
          textAlign: "center",
          boxShadow: "0 28px 80px rgba(79,70,229,0.34)",
        }}
      >
        入力が苦手な方でも、
        <br />
        声で見積明細を作れます。
      </div>
    </div>
  );
}

function SceneHeadline({
  from,
  badge,
  title,
  color,
}: {
  from: number;
  badge: string;
  title: string;
  color: string;
}) {
  const frame = useCurrentFrame();
  const y = slideY(frame, from, 54);

  return (
    <div
      style={{
        position: "absolute",
        left: 68,
        right: 68,
        top: 205 + y,
        color: colors.ink,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          borderRadius: 999,
          padding: "12px 20px",
          background: "rgba(15,23,42,0.44)",
          border: "1px solid rgba(255,255,255,0.22)",
          color,
          fontSize: 22,
          fontWeight: 900,
        }}
      >
        {badge}
      </div>
      <div style={{ marginTop: 26, fontSize: 64, lineHeight: 1.12, fontWeight: 900, letterSpacing: 0 }}>
        {title}
      </div>
    </div>
  );
}

function Subtitles() {
  const frame = useCurrentFrame();
  const active =
    frame < 96
      ? "見積もりを作るの、後回しになっていませんか。"
      : frame < 222
        ? "話した内容から、明細の下書きを作成。"
        : frame < 344
          ? "単価マスターで価格をそろえます。"
          : "Excelや他システムへの出力にも対応。";

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        bottom: 54,
        minHeight: 86,
        borderRadius: 22,
        background: "rgba(2,6,23,0.76)",
        border: "1px solid rgba(255,255,255,0.16)",
        color: "white",
        display: "grid",
        placeItems: "center",
        padding: "0 30px",
        fontFamily: "Yu Gothic, Meiryo, sans-serif",
        fontSize: 31,
        fontWeight: 900,
        textAlign: "center",
      }}
    >
      {active}
    </div>
  );
}

function VoiceEstimateShort() {
  return (
    <AbsoluteFill>
      <Background />
      <Audio src={staticFile("narration.mp3")} volume={1} />
      <BrandBar />
      <Sequence from={0} durationInFrames={118}>
        <TitleBlock from={0} duration={118} />
        <VoicePhone from={0} duration={118} />
      </Sequence>
      <Sequence from={104} durationInFrames={146}>
        <EstimateScene from={0} duration={146} />
      </Sequence>
      <Sequence from={238} durationInFrames={112}>
        <MasterScene from={0} duration={112} />
      </Sequence>
      <Sequence from={336} durationInFrames={114}>
        <ExportScene from={0} duration={114} />
      </Sequence>
      <Subtitles />
    </AbsoluteFill>
  );
}

export function RemotionRoot() {
  return (
    <Composition
      id="VoiceEstimateShort"
      component={VoiceEstimateShort}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
}
