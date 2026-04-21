export default function ZasadyOchrany() {
  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-16">
      <div className="max-w-3xl mx-auto">

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Zásady ochrany osobních údajů</h1>
          <p className="text-gray-400">Platné od 1. 1. 2025</p>
        </div>

        <div className="flex flex-col gap-6">

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Správce osobních údajů</h2>
            <p className="text-gray-300 leading-relaxed">
              Správcem osobních údajů je Dalibor Pašek, provozovatel webu Trail For All.
            </p>
            <p className="text-gray-300 leading-relaxed mt-2">
              Kontakt: info@pasek-art.cz
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Jaké údaje sbíráme</h2>
            <ul className="text-gray-300 leading-relaxed flex flex-col gap-2">
              <li>Email a heslo při registraci</li>
              <li>Volitelné údaje profilu: username, jméno, příjmení, město, rok narození, typ kola, úroveň jezdce, bio, odkazy na Strava a Instagram</li>
              <li>Obsah který přidáváš: traily, recenze</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Proč je sbíráme</h2>
            <ul className="text-gray-300 leading-relaxed flex flex-col gap-2">
              <li>Provoz a správa uživatelských účtů</li>
              <li>Zobrazení tvého obsahu ostatním uživatelům komunity</li>
              <li>Moderace obsahu administrátorem</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Jak dlouho je uchováváme</h2>
            <p className="text-gray-300 leading-relaxed">
              Osobní údaje uchováváme po dobu existence tvého účtu. Po smazání účtu jsou veškerá osobní data odstraněna do 30 dnů. Schválené traily se stávají součástí komunity a jsou zachovány bez osobních údajů autora.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Tvá práva</h2>
            <ul className="text-gray-300 leading-relaxed flex flex-col gap-2">
              <li>Právo na přístup ke svým datům</li>
              <li>Právo na opravu nebo výmaz osobních údajů</li>
              <li>Právo na přenositelnost dat — export dostupný přímo v profilu</li>
              <li>Právo vznést námitku proti zpracování</li>
              <li>Právo podat stížnost u Úřadu pro ochranu osobních údajů (uoou.cz)</li>
            </ul>
            <p className="text-gray-400 text-sm mt-4">
              Veškeré žádosti ohledně osobních údajů zasílej na: info@pasek-art.cz
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Zabezpečení</h2>
            <p className="text-gray-300 leading-relaxed">
              Data jsou uložena v databázi Supabase s šifrováním. Hesla jsou ukládána výhradně v hashované podobě a nejsou nikdy čitelná ani pro správce webu.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
