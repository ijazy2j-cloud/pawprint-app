export type SosNgoAlertEmailProps = {
  district: string;
  condition: string;
  description?: string | null;
  photoUrl?: string | null;
  reportUrl: string;
};

const labels = {
  en: {
    preview: "New SOS Paw rescue report needs NGO attention",
    heading: "New SOS Paw rescue report",
    intro: "A new urgent pet rescue report was submitted in your coverage area.",
    district: "District",
    condition: "Condition",
    description: "Description",
    cta: "Open rescue dashboard",
    sinhalaReady: "Sinhala translation slot: ready for සිංහල copy.",
  },
};

export function SosNgoAlertEmail({ district, condition, description, photoUrl, reportUrl }: SosNgoAlertEmailProps) {
  return (
    <html>
      <head>
        <title>{labels.en.preview}</title>
      </head>
      <body style={main}>
        <main style={container}>
          <h1 style={h1}>{labels.en.heading}</h1>
          <p style={text}>{labels.en.intro}</p>
          {photoUrl ? <img src={photoUrl} alt="SOS report" width="100%" style={image} /> : null}
          <section style={summary}>
            <p style={text}><strong>{labels.en.district}:</strong> {district}</p>
            <p style={text}><strong>{labels.en.condition}:</strong> {condition}</p>
            {description ? <p style={text}><strong>{labels.en.description}:</strong> {description}</p> : null}
          </section>
          <a href={reportUrl} style={button}>{labels.en.cta}</a>
          <hr style={hr} />
          <p style={small}>{labels.en.sinhalaReady}</p>
        </main>
      </body>
    </html>
  );
}

const main = { backgroundColor: "#f8f5ef", fontFamily: "Arial, sans-serif", margin: 0, padding: "1px" };
const container = { backgroundColor: "#ffffff", borderRadius: "16px", margin: "24px auto", padding: "24px", width: "92%", maxWidth: "520px" };
const h1 = { color: "#7c2d12", fontSize: "24px", lineHeight: "32px" };
const text = { color: "#1f2937", fontSize: "16px", lineHeight: "24px" };
const small = { color: "#6b7280", fontSize: "13px", lineHeight: "20px" };
const image = { borderRadius: "12px", margin: "12px 0", objectFit: "cover" as const };
const summary = { backgroundColor: "#fff7ed", borderRadius: "12px", padding: "12px 16px" };
const button = { backgroundColor: "#c2410c", borderRadius: "10px", color: "#ffffff", display: "block", fontSize: "16px", marginTop: "20px", padding: "12px 18px", textAlign: "center" as const, textDecoration: "none" };
const hr = { borderColor: "#fed7aa", margin: "24px 0" };
