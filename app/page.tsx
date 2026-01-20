import LeadForm from '@/components/LeadForm';

export default function HomePage() {
  return (
    <main className="container">
      <header>
        <span className="badge">⚡ DecideCasa B2B • Borrador</span>
        <h1 className="h1">Leads calificados + ranking explicable para cerrar más rápido</h1>
        <p className="sub">
          Capturamos la necesidad real del comprador, generamos un ranking con explicación y te entregamos un lead listo
          para la conversación comercial.
        </p>
        <div className="kpi">
          <div className="card">
            <div className="small">Promesa</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Menos visitas improductivas</div>
          </div>
          <div className="card">
            <div className="small">Output</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Argumentario por lead</div>
          </div>
          <div className="card">
            <div className="small">Control</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Tracking de embudo</div>
          </div>
        </div>
      </header>

      <section className="grid grid2" style={{ marginTop: 18 }}>
        <div className="card">
          <h2 style={{ margin: 0 }}>Cómo funciona (para brokers/inmobiliarias)</h2>
          <ol className="sub">
            <li>El comprador responde un brief de 60 segundos.</li>
            <li>DecideCasa genera recomendaciones con explicación (score + razones).</li>
            <li>Te llega el lead con preferencias, objeciones resueltas y próximos pasos sugeridos.</li>
          </ol>
          <hr />
          <h3 style={{ margin: '0 0 8px' }}>Qué recibes por cada lead</h3>
          <ul className="sub" style={{ marginTop: 0 }}>
            <li>Preferencias estructuradas: presupuesto, distrito, tipología, urgencia.</li>
            <li>Top recomendaciones + “por qué” (explicabilidad para vender).</li>
            <li>Probabilidad de intención (scoring simple) y priorización.</li>
            <li>Registro UTM + fuente + campaña para medir rendimiento.</li>
          </ul>
          <p className="small">
            Nota: este es un borrador comercial. El scoring real se conecta a tu pipeline housing (bronze/silver/gold) en V1.
          </p>
        </div>

        <div className="card">
          <h2 style={{ margin: 0 }}>Solicita demo + recibe leads</h2>
          <p className="sub" style={{ marginTop: 8 }}>
            Déjanos tus datos y activamos el flujo: Lead → Score → CRM → WhatsApp/Email.
          </p>
          <LeadForm />
        </div>
      </section>

      <section className="card" style={{ marginTop: 14 }}>
        <h2 style={{ margin: 0 }}>¿Eres comprador final?</h2>
        <p className="sub" style={{ marginTop: 8 }}>
          Puedes usar DecideCasa gratis para orientarte y llegar con claridad a tu asesor.
        </p>
        <button className="btn btnSecondary" disabled title="Conectar con demo Streamlit en el siguiente paso">
          Abrir demo (próximamente)
        </button>
      </section>

      <footer className="footer">
        DecideCasa © {new Date().getFullYear()} • Borrador MVP • Lima/LatAm
      </footer>
    </main>
  );
}
