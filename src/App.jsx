import { useState, useEffect } from "react";

// === BARVY ===
const BLUE = "#0033A0";
const RED = "#E4002B";
const LIGHT_BG = "#F0F4FA";
const WHITE = "#ffffff";
const BORDER = "#CBD5E8";
const DARK = "#1A1A2E";
const MID = "#6B7280";
const FONT = "'Inter', 'Segoe UI', system-ui, sans-serif";

const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL;

// === PROFILY KOLEGŮ ===
const PROFILES = [
  { id: "michal", name: "Michal Něnička",   role: "Sales, PLP Czech Republic",      styleExamples: "" },
  { id: "petr",   name: "Petr Kabilka",     role: "Sales, PLP Czech Republic",      styleExamples: "" },
  { id: "pavel",  name: "Pavel Schuster",   role: "Sales, PLP Czech Republic",      styleExamples: "" },
  { id: "karel",  name: "Karel Pospíšilík", role: "Marketing, PLP Czech Republic",  styleExamples: "" },
];

// === POMOCNÉ KOMPONENTY ===
const SectionLabel = ({ num, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "10px",
    marginBottom: "18px", paddingBottom: "10px", borderBottom: `2px solid ${RED}` }}>
    <span style={{ color: RED, fontWeight: "700", fontSize: "12px",
      letterSpacing: "2px", fontFamily: "monospace" }}>
      {String(num).padStart(2, "0")} —
    </span>
    <span style={{ color: BLUE, fontWeight: "700", fontSize: "12px",
      letterSpacing: "2px", textTransform: "uppercase" }}>
      {text}
    </span>
  </div>
);

const Spinner = () => (
  <span style={{
    display: "inline-block", width: "14px", height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white", borderRadius: "50%",
    animation: "spin 0.8s linear infinite", marginRight: "8px",
    verticalAlign: "middle",
  }} />
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: WHITE, borderRadius: "8px", padding: "28px",
    boxShadow: "0 1px 4px #0002", marginBottom: "16px", ...style }}>
    {children}
  </div>
);

const PrimaryBtn = ({ onClick, disabled, loading, children }) => (
  <button onClick={onClick} disabled={disabled || loading} style={{
    background: (disabled || loading) ? BORDER : RED,
    color: WHITE, border: "none", padding: "12px 32px", borderRadius: "4px",
    fontWeight: "700", fontSize: "13px", letterSpacing: "1px",
    textTransform: "uppercase", cursor: (disabled || loading) ? "not-allowed" : "pointer",
    fontFamily: FONT, transition: "background .15s", display: "inline-flex",
    alignItems: "center",
  }}>
    {loading && <Spinner />}
    {children}
  </button>
);

const SecondaryBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    background: WHITE, color: BLUE, border: `2px solid ${BLUE}`,
    padding: "12px 24px", borderRadius: "4px", fontWeight: "700",
    fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase",
    cursor: "pointer", fontFamily: FONT,
  }}>
    {children}
  </button>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, autoFocus, onKeyDown }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
      color: MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      style={{
        width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: "6px",
        padding: "10px 14px", fontSize: "14px", fontFamily: FONT,
        color: DARK, background: "#FAFBFD", outline: "none",
        boxSizing: "border-box",
      }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
      color: MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
      {label}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", border: `1.5px solid ${BORDER}`, borderRadius: "6px",
      padding: "10px 14px", fontSize: "14px", fontFamily: FONT,
      color: DARK, background: "#FAFBFD", outline: "none",
      boxSizing: "border-box", cursor: "pointer",
    }}
      onFocus={e => e.target.style.borderColor = BLUE}
      onBlur={e => e.target.style.borderColor = BORDER}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// === STEP BAR ===
const STEPS = ["Přihlášení", "Kontext", "Témata", "Příspěvek", "Obrázek", "Autorizace"];

const StepBar = ({ current, topicMode }) => {
  const visibleSteps = topicMode === "custom"
    ? ["Přihlášení", "Kontext", "Příspěvek", "Obrázek", "Autorizace"]
    : STEPS;
  const visualStep = topicMode === "custom" && current >= 4 ? current - 1 : current;

  return (
    <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`,
      padding: "0 32px", display: "flex", flexWrap: "wrap" }}>
      {visibleSteps.map((s, i) => (
        <div key={i} style={{
          padding: "12px 20px", fontSize: "12px", fontWeight: "700",
          letterSpacing: "1px", textTransform: "uppercase",
          color: visualStep === i + 1 ? BLUE : visualStep > i + 1 ? RED : MID,
          borderBottom: visualStep === i + 1 ? `3px solid ${BLUE}` : "3px solid transparent",
        }}>
          {visualStep > i + 1 ? "✓ " : `${i + 1}. `}{s}
        </div>
      ))}
    </div>
  );
};

// === API HELPER ===
const callClaude = async (prompt, maxTokens = 1000) => {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Chyba Claude API");
  }
  const data = await res.json();
  return data.text || "";
};

// === HLAVNÍ KOMPONENTA ===
export default function LinkedInPostGenerator() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const [step, setStep] = useState(1);

  // Přihlášení
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Profil
  const [selectedProfileId, setSelectedProfileId] = useState("");

  // Krok 2 – kontext
  const [language, setLanguage] = useState("cs");
  const [tone, setTone] = useState("insightful");
  const [topicMode, setTopicMode] = useState(null);
  const [customTopic, setCustomTopic] = useState("");

  // Krok 3 – témata
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Krok 4 – post
  const [post, setPost] = useState("");
  const [loadingPost, setLoadingPost] = useState(false);
  const [loadingPolish, setLoadingPolish] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  // Krok 5 – obrázek
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageOptions, setImageOptions] = useState([]); // 3 návrhy URL
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const profile = PROFILES.find(p => p.id === selectedProfileId) || null;
  const step2Valid = topicMode === "ai" || (topicMode === "custom" && customTopic.trim().length > 0);

  // === PŘIHLÁŠENÍ ===
  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPassword) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setSelectedProfileId(data.profileId);
        setStep(2);
      } else {
        setLoginError(data.error || "Nesprávný email nebo heslo.");
      }
    } catch {
      setLoginError("Chyba připojení. Zkus to znovu.");
    } finally {
      setLoginLoading(false);
    }
  };

  // === GENEROVÁNÍ TÉMAT ===
  const generateTopics = async () => {
    setLoadingTopics(true);
    setTopics([]);
    setSelectedTopic(null);

    const langLabel = language === "cs" ? "češtině" : "angličtině";
    const toneMap = {
      insightful: "insightful, odborný",
      storytelling: "storytelling, osobní příběh",
      casual: "casual, přátelský",
      "data-driven": "data-driven, faktický",
    };

    const prompt = `Jsi expert na LinkedIn obsah v oboru telekomunikační infrastruktury a FTTx sítí.
Vygeneruj 5 silných nápadů na LinkedIn příspěvky pro:
- Jméno: ${profile.name}
- Role: ${profile.role}
- Tón: ${toneMap[tone] || tone}
- Jazyk: ${langLabel}

Každý nápad musí být autentický, hodnotný a konkrétní.

Pro pole "description" napiš 1-2 věty v druhé osobě, jako by agent oslovoval autora a představoval mu téma.
Začni slovesem v přítomném čase. Příklady stylu: "Sdílíš zkušenost z...", "Otevřeš diskuzi o...", "Ukážeš, jak...", "Představíš pohled na...".
Vrať POUZE JSON pole bez markdown:
[{"id": 1, "title": "Název tématu", "description": "Sdílíš... / Otevřeš... / Ukážeš..."}, ...]`;

    try {
      const text = await callClaude(prompt, 1000);
      setTopics(JSON.parse(text.replace(/```json|```/g, "").trim()));
      setStep(3);
    } catch (e) {
      alert("Chyba při generování témat: " + e.message);
    } finally {
      setLoadingTopics(false);
    }
  };

  // === GENEROVÁNÍ IMAGE PROMPTU ===
  const generateImagePromptText = async (postText) => {
    return await callClaude(
      `Na základě tohoto LinkedIn příspěvku napiš krátký anglický prompt pro generátor obrázků DALL-E 3. Prompt má být max 2 věty, profesionální, firemní styl, bez textu v obrázku. Příspěvek:\n\n${postText}`,
      300
    );
  };

  // === GENEROVÁNÍ POSTU ===
  const generatePost = async (topic) => {
    const t = topic || selectedTopic;
    if (!t) return;
    setLoadingPost(true);
    setPost("");
    setSendStatus(null);

    const langLabel = language === "cs" ? "češtině" : "angličtině";
    const toneMap = {
      insightful: "insightful, odborný ale přístupný",
      storytelling: "storytelling – příběh z praxe",
      casual: "casual a přátelský",
      "data-driven": "data-driven, faktický s čísly",
    };
    const styleSection = profile.styleExamples
      ? `\nNapodobuj styl těchto ukázkových příspěvků:\n---\n${profile.styleExamples}\n---`
      : "";
    const topicDesc = t.description
      ? `Téma: ${t.title}\nPopis: ${t.description}`
      : `Téma: ${t.title}`;

    const prompt = `Napiš kompletní LinkedIn příspěvek v ${langLabel} pro ${profile.name} (${profile.role}).
Tón: ${toneMap[tone] || tone}
${styleSection}
${topicDesc}

Pravidla: první věta okamžitě zaujme, žádné korporátní fráze, přirozené odstavce, výzva k akci nebo otázka na konci, 3-5 hashtagů, 150-300 slov.
Vrať POUZE text příspěvku.`;

    try {
      const generatedPost = await callClaude(prompt, 1000);
      setPost(generatedPost);
      const autoPrompt = await generateImagePromptText(generatedPost);
      setImagePrompt(autoPrompt);
      setStep(4);
    } catch (e) {
      alert("Chyba při generování příspěvku: " + e.message);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleStep2Next = () => {
    if (topicMode === "ai") {
      generateTopics();
    } else {
      const t = { id: "custom", title: customTopic.trim(), description: "" };
      setSelectedTopic(t);
      generatePost(t);
    }
  };

  // === GENEROVÁNÍ 3 OBRÁZKŮ ===
  const generateImage = async () => {
    if (!imagePrompt.trim()) return;
    setLoadingImage(true);
    setImageOptions([]);
    setSelectedImageUrl("");
    setImageError("");
    try {
      const callImage = () => fetch("/api/openai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      }).then(r => r.json());

      const results = await Promise.all([callImage(), callImage(), callImage()]);
      const urls = results.filter(d => d.url).map(d => d.url);
      if (urls.length === 0) {
        setImageError(results[0]?.error || "Obrázky se nepodařilo vygenerovat.");
      } else {
        setImageOptions(urls);
      }
    } catch (e) {
      setImageError("Chyba při generování obrázků: " + e.message);
    } finally {
      setLoadingImage(false);
    }
  };

  // === UHLADIT PŘÍSPĚVEK ===
  const polishPost = async () => {
    if (!post.trim()) return;
    setLoadingPolish(true);
    const prompt = `Jsi copywriter specialista na LinkedIn obsah. Uživatel upravil následující příspěvek, ale text se stal kostrbatým a těžko čitelným.

Tvůj úkol:
- Zachovat VEŠKERÝ původní obsah a myšlenky beze změny
- Zachovat stejnou délku textu
- Opravit gramatické chyby, uhladit formulace, opravit plynulost a čitelnost
- Neměnit tón, styl ani strukturu
- Zachovat všechny původní hashtags

Příspěvek k úpravě:
${post}

Vrať POUZE upravený text příspěvku, nic jiného.`;
    try {
      const text = await callClaude(prompt, 1000);
      if (text) setPost(text);
    } catch (e) {
      alert("Chyba při úpravě příspěvku: " + e.message);
    } finally {
      setLoadingPolish(false);
    }
  };

  // === ODESLÁNÍ NA MAKE ===
  const sendToMake = async () => {
    setSendStatus("sending");
    try {
      await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: profile?.name,
          author_role: profile?.role,
          topic: selectedTopic?.title,
          language,
          post_text: post,
          image_url: selectedImageUrl || "",
          timestamp: new Date().toISOString(),
        }),
      });
      setSendStatus("ok");
    } catch {
      setSendStatus("error");
    }
  };

  const reset = () => {
    setStep(1);
    setLoginEmail("");
    setLoginPassword("");
    setLoginError("");
    setSelectedProfileId("");
    setTopicMode(null);
    setCustomTopic("");
    setTopics([]);
    setSelectedTopic(null);
    setPost("");
    setSendStatus(null);
    setImageOptions([]);
    setSelectedImageUrl("");
    setImagePrompt("");
    setImageError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: LIGHT_BG, fontFamily: FONT, color: DARK }}>

      {/* HEADER */}
      <div style={{ background: BLUE, display: "flex", alignItems: "stretch",
        justifyContent: "space-between", height: "56px" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: "4px", background: RED, alignSelf: "stretch", flexShrink: 0 }} />
          <span style={{ color: WHITE, fontWeight: "800", fontSize: "16px",
            letterSpacing: "2px", textTransform: "uppercase", paddingLeft: "27px", fontFamily: FONT }}>
            LinkedIn Post Generator
          </span>
        </div>
        {step > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingRight: "32px" }}>
            {profile && (
              <span style={{ color: WHITE, fontSize: "13px", opacity: 0.85 }}>
                {profile.name}
              </span>
            )}
            <button onClick={reset} style={{
              background: "transparent", border: `1px solid ${WHITE}40`,
              color: WHITE, padding: "4px 14px", borderRadius: "4px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              textTransform: "uppercase", fontFamily: FONT,
            }}>↺ Reset</button>
          </div>
        )}
      </div>

      {/* STEP BAR */}
      <StepBar current={step} topicMode={topicMode} />

      {/* CONTENT */}
      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ===== KROK 1 – PŘIHLÁŠENÍ ===== */}
        {step === 1 && (
          <>
            <Card>
              <SectionLabel num={1} text="Přihlášení" />
              <InputField
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="vas@email.cz"
                autoFocus
                onKeyDown={e => e.key === "Enter" && !loginLoading && handleLogin()}
              />
              <InputField
                label="Heslo"
                type="password"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="••••••••"
                onKeyDown={e => e.key === "Enter" && !loginLoading && handleLogin()}
              />
              {loginError && (
                <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5",
                  borderRadius: "6px", padding: "10px 14px", fontSize: "13px",
                  color: "#DC2626", marginTop: "4px" }}>
                  {loginError}
                </div>
              )}
            </Card>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PrimaryBtn
                onClick={handleLogin}
                disabled={!loginEmail.trim() || !loginPassword}
                loading={loginLoading}
              >
                Přihlásit se →
              </PrimaryBtn>
            </div>
          </>
        )}

        {/* ===== KROK 2 – KONTEXT ===== */}
        {step === 2 && (
          <>
            <Card>
              <SectionLabel num={1} text="Styl" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <SelectField label="Jazyk" value={language} onChange={setLanguage}
                  options={[
                    { value: "cs", label: "🇨🇿 Čeština" },
                    { value: "en", label: "🇬🇧 Angličtina" },
                  ]} />
                <SelectField label="Tón" value={tone} onChange={setTone}
                  options={[
                    { value: "insightful", label: "Insightful – odborný" },
                    { value: "storytelling", label: "Storytelling – příběh" },
                    { value: "casual", label: "Casual – přátelský" },
                    { value: "data-driven", label: "Data-driven – faktický" },
                  ]} />
              </div>
            </Card>

            <Card>
              <SectionLabel num={2} text="Nápad" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
                marginBottom: topicMode ? "20px" : "0" }}>
                {[
                  { key: "ai",     line1: "Nic mě nenapadá,", line2: "něco navrhni" },
                  { key: "custom", line1: "Napiš příspěvek",  line2: "na toto téma" },
                ].map(opt => {
                  const active = topicMode === opt.key;
                  return (
                    <div key={opt.key} onClick={() => setTopicMode(opt.key)} style={{
                      border: `2px solid ${active ? BLUE : BORDER}`,
                      borderRadius: "8px", padding: "16px 18px",
                      cursor: "pointer", background: active ? "#EEF3FF" : WHITE,
                      transition: "all .15s",
                    }}>
                      <div style={{ fontWeight: "700", fontSize: "13px",
                        color: active ? BLUE : DARK, lineHeight: "1.5" }}>
                        {opt.line1}
                      </div>
                      <div style={{ fontWeight: "700", fontSize: "13px",
                        color: active ? BLUE : DARK }}>
                        {opt.line2}
                      </div>
                    </div>
                  );
                })}
              </div>

              {topicMode === "custom" && (
                <div style={{ animation: "fadeIn .2s ease" }}>
                  <textarea
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    placeholder={`Napiš něco ve stylu:\n• Chystám se na veletrh...\n• Právě jsme dokončili nový projekt...\n• 5 tipů na lepší optickou síť...`}
                    rows={5}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      border: `1.5px solid ${BORDER}`, borderRadius: "6px",
                      padding: "12px 14px", fontSize: "14px", fontFamily: FONT,
                      lineHeight: "1.7", resize: "vertical", outline: "none",
                      color: DARK, background: "#FAFBFD",
                    }}
                    onFocus={e => e.target.style.borderColor = BLUE}
                    onBlur={e => e.target.style.borderColor = BORDER}
                    autoFocus
                  />
                </div>
              )}
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <SecondaryBtn onClick={() => setStep(1)}>← Zpět</SecondaryBtn>
              <PrimaryBtn onClick={handleStep2Next} disabled={!step2Valid} loading={loadingTopics || loadingPost}>
                {topicMode === "ai" ? "Pokračovat na témata →" : "Pokračovat na příspěvek →"}
              </PrimaryBtn>
            </div>
          </>
        )}

        {/* ===== KROK 3 – VÝBĚR TÉMATU (AI mode) ===== */}
        {step === 3 && (
          <>
            <Card>
              <SectionLabel num={1} text="Výběr tématu" />
              {topics.map(t => (
                <div key={t.id} onClick={() => setSelectedTopic(t)} style={{
                  border: `2px solid ${selectedTopic?.id === t.id ? BLUE : BORDER}`,
                  borderRadius: "8px", padding: "16px 20px", marginBottom: "10px",
                  cursor: "pointer", background: selectedTopic?.id === t.id ? "#EEF3FF" : WHITE,
                  transition: "all .15s",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                      background: selectedTopic?.id === t.id ? BLUE : LIGHT_BG,
                      border: `2px solid ${selectedTopic?.id === t.id ? BLUE : BORDER}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "800",
                      color: selectedTopic?.id === t.id ? WHITE : MID,
                    }}>
                      {t.id}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: DARK, marginBottom: "6px" }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: "13px", color: BLUE, fontStyle: "italic", lineHeight: "1.6" }}>
                        {t.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <SecondaryBtn onClick={() => setStep(2)}>← Zpět</SecondaryBtn>
              <PrimaryBtn onClick={() => generatePost()} disabled={!selectedTopic} loading={loadingPost}>
                Pokračovat na příspěvek →
              </PrimaryBtn>
            </div>
          </>
        )}

        {/* ===== KROK 4 – POST ===== */}
        {step === 4 && (
          <>
            <Card>
              <SectionLabel num={1} text="Návrh příspěvku" />
              <div style={{ fontSize: "12px", color: MID, marginBottom: "12px" }}>
                Autor: <strong style={{ color: DARK }}>{profile?.name}</strong>
                &nbsp;·&nbsp;
                Téma: <strong style={{ color: BLUE }}>{selectedTopic?.title}</strong>
              </div>
              <textarea value={post} onChange={e => setPost(e.target.value)} rows={14}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: `1.5px solid ${BORDER}`, borderRadius: "6px",
                  padding: "14px 16px", fontSize: "14px", fontFamily: FONT,
                  lineHeight: "1.8", resize: "vertical", outline: "none",
                  color: DARK, background: "#FAFBFD",
                }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
              <div style={{ fontSize: "11px", color: MID, marginTop: "6px" }}>
                {post.length} znaků · Text lze ručně upravit.
              </div>
            </Card>

            <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
              <SecondaryBtn onClick={() => setStep(topicMode === "ai" ? 3 : 2)}>← Zpět</SecondaryBtn>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={() => generatePost()} disabled={loadingPost} style={{
                  background: WHITE, color: BLUE, border: `2px solid ${BLUE}`,
                  padding: "12px 24px", borderRadius: "4px", fontWeight: "700",
                  fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase",
                  cursor: loadingPost ? "not-allowed" : "pointer", fontFamily: FONT,
                  opacity: loadingPost ? 0.5 : 1, display: "inline-flex", alignItems: "center",
                }}>
                  {loadingPost ? <><Spinner />Předělávám...</> : "↺ Předělat příspěvek"}
                </button>
                <button
                  onClick={!loadingPolish && !loadingPost ? polishPost : undefined}
                  style={{
                    background: WHITE, color: BLUE, border: `2px solid ${BLUE}`,
                    padding: "12px 24px", borderRadius: "4px", fontWeight: "700",
                    fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase",
                    cursor: (loadingPolish || loadingPost) ? "not-allowed" : "pointer", fontFamily: FONT,
                    opacity: (loadingPolish || loadingPost) ? 0.5 : 1,
                    display: "inline-flex", alignItems: "center",
                    pointerEvents: (loadingPolish || loadingPost) ? "none" : "auto",
                  }}
                >
                  {loadingPolish ? <><Spinner />Uhlazuji...</> : "✦ Uhladit příspěvek"}
                </button>
                <PrimaryBtn onClick={() => setStep(5)}>
                  Pokračovat na obrázek →
                </PrimaryBtn>
              </div>
            </div>
          </>
        )}

        {/* ===== KROK 5 – OBRÁZEK ===== */}
        {step === 5 && (
          <>
            <Card>
              <SectionLabel num={1} text="Obrázek" />
              <div style={{ fontSize: "12px", color: MID, marginBottom: "16px" }}>
                AI vygenerovala návrh promptu z textu příspěvku. Uprav ho a vygeneruj 3 návrhy obrázků.
              </div>

              <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                color: MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                Prompt pro generátor
              </label>
              <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  border: `1.5px solid ${BORDER}`, borderRadius: "6px",
                  padding: "12px 14px", fontSize: "14px", fontFamily: FONT,
                  lineHeight: "1.7", resize: "vertical", outline: "none",
                  color: DARK, background: "#FAFBFD", marginBottom: "16px",
                }}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e => e.target.style.borderColor = BORDER}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                <PrimaryBtn onClick={generateImage} disabled={!imagePrompt.trim() || loadingImage} loading={loadingImage}>
                  {imageOptions.length === 0 ? "Generovat obrázky →" : "↺ Vygenerovat nové obrázky"}
                </PrimaryBtn>
              </div>

              {imageError && (
                <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5",
                  borderRadius: "6px", padding: "12px 16px", fontSize: "13px",
                  color: "#DC2626", marginBottom: "16px" }}>
                  ⚠ {imageError}
                </div>
              )}

              {loadingImage && imageOptions.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px", color: MID, fontSize: "13px" }}>
                  <div style={{ marginBottom: "12px", fontSize: "24px" }}>🎨</div>
                  Generuji 3 návrhy obrázků, moment…
                </div>
              )}

              {imageOptions.length > 0 && (
                <>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: MID,
                    letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
                    Vyber jeden obrázek
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    {imageOptions.map((url, i) => {
                      const selected = selectedImageUrl === url;
                      return (
                        <div key={i} onClick={() => setSelectedImageUrl(url)} style={{
                          cursor: "pointer", borderRadius: "8px",
                          border: `3px solid ${selected ? BLUE : BORDER}`,
                          overflow: "hidden", position: "relative",
                          transition: "border-color .15s",
                          boxShadow: selected ? `0 0 0 2px ${BLUE}40` : "none",
                        }}>
                          <img src={url} alt={`Návrh ${i + 1}`}
                            style={{ width: "100%", display: "block" }} />
                          {selected && (
                            <div style={{
                              position: "absolute", top: "8px", right: "8px",
                              background: BLUE, color: WHITE, borderRadius: "50%",
                              width: "24px", height: "24px", display: "flex",
                              alignItems: "center", justifyContent: "center",
                              fontSize: "13px", fontWeight: "800",
                            }}>✓</div>
                          )}
                          <div style={{
                            position: "absolute", bottom: "0", left: "0", right: "0",
                            background: selected ? `${BLUE}CC` : "#0002",
                            color: WHITE, fontSize: "11px", fontWeight: "700",
                            textAlign: "center", padding: "6px",
                            letterSpacing: "1px", textTransform: "uppercase",
                          }}>
                            {selected ? "✓ Vybráno" : `Návrh ${i + 1}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </Card>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <SecondaryBtn onClick={() => setStep(4)}>← Zpět</SecondaryBtn>
              <PrimaryBtn onClick={() => setStep(6)} disabled={!selectedImageUrl}>
                Pokračovat na autorizaci →
              </PrimaryBtn>
            </div>
          </>
        )}

        {/* ===== KROK 6 – AUTORIZACE & ODESLÁNÍ ===== */}
        {step === 6 && (
          <>
            <Card>
              <SectionLabel num={1} text="Autorizace" />
              <div style={{ fontSize: "13px", color: MID, marginBottom: "16px" }}>
                Autor: <strong style={{ color: DARK }}>{profile?.name}</strong>
                &nbsp;·&nbsp;
                Téma: <strong style={{ color: BLUE }}>{selectedTopic?.title}</strong>
              </div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                color: MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                Text
              </label>
              <div style={{ background: LIGHT_BG, borderRadius: "6px", padding: "14px 16px",
                fontSize: "14px", lineHeight: "1.8", color: DARK, marginBottom: "20px",
                whiteSpace: "pre-wrap" }}>
                {post}
              </div>

              {selectedImageUrl ? (
                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                    color: MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                    Obrázek
                  </label>
                  <img src={selectedImageUrl} alt="Obrázek k příspěvku"
                    style={{ width: "100%", borderRadius: "8px", border: `1px solid ${BORDER}` }} />
                </div>
              ) : (
                <div style={{ marginTop: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "700",
                    color: MID, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
                    Obrázek
                  </label>
                  <div style={{
                    width: "100%", aspectRatio: "1 / 1", maxHeight: "300px",
                    borderRadius: "8px", border: `2px dashed ${BORDER}`,
                    background: LIGHT_BG, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "8px",
                  }}>
                    <div style={{ fontSize: "32px", opacity: 0.3 }}>🖼</div>
                    <div style={{ fontSize: "12px", color: MID, fontWeight: "600" }}>
                      Obrázek nebyl vygenerován
                    </div>
                    <div style={{ fontSize: "11px", color: MID }}>
                      Vrať se na krok Obrázek a vygeneruj ho
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {sendStatus === "ok" && (
              <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7",
                borderRadius: "8px", padding: "16px 20px", color: "#059669",
                fontWeight: "700", fontSize: "14px", marginBottom: "16px" }}>
                ✓ Odesláno na Make! LinkedIn draft se zpracovává.
              </div>
            )}
            {sendStatus === "error" && (
              <div style={{ background: "#FEE2E2", border: "1px solid #FCA5A5",
                borderRadius: "8px", padding: "16px 20px", color: "#DC2626",
                fontWeight: "700", fontSize: "14px", marginBottom: "16px" }}>
                ⚠ Chyba při odesílání. Zkontroluj Make webhook URL.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <SecondaryBtn onClick={() => setStep(5)}>← Zpět</SecondaryBtn>
              <PrimaryBtn
                onClick={sendToMake}
                disabled={!post.trim() || sendStatus === "ok"}
                loading={sendStatus === "sending"}
              >
                {sendStatus === "ok" ? "✓ Odesláno" : "Odeslat na LinkedIn →"}
              </PrimaryBtn>
            </div>
          </>
        )}

      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        textarea::placeholder { color: #bbb; white-space: pre-line; }
        textarea:focus { outline: none; }
        button:focus { outline: none; }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
}
