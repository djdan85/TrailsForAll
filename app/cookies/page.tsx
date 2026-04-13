export default function Cookies() {
  return (
    <div className="min-h-screen bg-gray-950 pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">

        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Zásady cookies</h1>
          <p className="text-gray-400">Platné od 1. 1. 2025</p>
        </div>

        <div className="flex flex-col gap-6">

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Co jsou cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies jsou malé textové soubory ukládané do tvého prohlížeče při návštěvě webu. Pomáhají webu zapamatovat si tvoje nastavení a přihlášení.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Nezbytné cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Tyto cookies jsou nutné pro základní fungování webu. Nevyžadují tvůj souhlas.
            </p>
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-white text-sm font-semibold mb-1">Přihlašovací session</p>
              <p className="text-gray-400 text-sm">Uchovává informaci o přihlášení uživatele. Poskytovatel: Supabase.</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Analytické cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Momentálně nepoužíváme žádné analytické nástroje ani cookies třetích stran pro sledování návštěvnosti.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Reklamní cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Momentálně nepoužíváme žádnou reklamu ani reklamní cookies. V budoucnu bude případná reklama vždy nenápadná a nikdy nepřebije důležité prvky webu. Reklamní cookies budou vyžadovat tvůj výslovný souhlas.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Jak spravovat cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Cookies můžeš kdykoli vymazat nebo zakázat v nastavení svého prohlížeče. Vypnutí nezbytných cookies může omezit funkčnost webu — například nebudeš moci zůstat přihlášen.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Návody pro správu cookies ve vybraných prohlížečích:
            </p>
            <ul className="text-gray-400 text-sm mt-3 flex flex-col gap-1">
              <li>Chrome: Nastavení → Soukromí a zabezpečení → Soubory cookie</li>
              <li>Firefox: Nastavení → Soukromí a zabezpečení → Cookies</li>
              <li>Safari: Předvolby → Soukromí → Spravovat data webů</li>
              <li>Edge: Nastavení → Soukromí, vyhledávání a služby → Cookies</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-4">Kontakt</h2>
            <p className="text-gray-300 leading-relaxed">
              Máš otázky ohledně cookies nebo zpracování dat? Napiš nám na info@pasek-art.cz
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}