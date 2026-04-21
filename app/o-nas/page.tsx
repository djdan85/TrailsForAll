'use client'

export default function ONas() {
  return (
    <div className="min-h-screen bg-gray-950 pt-28 px-4 pb-16">
      <div className="max-w-3xl mx-auto">

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">O nás</h1>
          <p className="text-orange-500 text-lg font-semibold">Trails for All — traily pro všechny generace</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Jak to celé vzniklo</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Čau, jsem Dalibor Pašek — kamarádi mi říkají Dane. Kolo je moje srdeční záležitost a traily jsou to, kvůli čemu ráno vstávám. Trails for All jsem rozjel prostě proto, že jsem nenašel appku, která by mi seděla a přitom nestála majlant.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Chci být součástí parády, kde si lidi pomáhají, jedou spolu a táhnou za jeden provaz. Jestli jsi fanoušek dětské dráhy, mladej závodník, táta s dětma nebo ostřílený matador co pamatuje první hardtaily — je jedno. Spojuje nás jedno: šlápnout do pedálů a pořádně si to rozdat.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Naše vize</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Pomalu ale jistě chceme mapovat ověřené a vyjeté traily — takové, o kterých mnohdy nikdo netuší, přitom je má kousek za barákem nebo za nejbližším kopcem. Plzeňsko, Šumava, Brdy, Krušné hory... a klidně dál.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Vize je jasná: podpořit cykloturistiku pro všechny generace a vytvořit místo, kde si každý biker najde svůj trail — ať chce flow, techniku, nebo jen klidnou vyjížďku s rodinou.
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Zdarma — a tak to myslíme!</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Trails for All je teď v testovacím provozu — zkoušíme, ladíme a stavíme. Pro uživatele je všechno zdarma a žádné předplatné neplánujeme. Pokud jednou přijde reklama, bude vždy nenápadná a nikdy nepřebije to podstatné. Prostě jako dobrý parťák na trail — jede vedle tebe, netlačí se před tebe.
          </p>
          <h3 className="text-white font-semibold mb-3">Chceš nám pomoct?</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Projekt provozujeme z vlastní kapsy — doména, hosting, vývoj. Pokud tě Trails for All baví, jakýkoliv příspěvek nás posune dál. Není to povinnost — je to jen gesto od bikera bikerům. 🤜🤛
          </p>
          <button
            onClick={() => window.location.href = 'mailto:info@pasek-art.cz'}
            className="text-orange-500 hover:text-orange-400 transition text-sm font-semibold"
          >
            Ozvi se nám na info@pasek-art.cz →
          </button>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Co nabízíme</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">🗺️</div>
              <h3 className="text-white font-semibold mb-2">Mapa trailů</h3>
              <p className="text-gray-400 text-sm">Interaktivní mapa s ověřenými traily po celé ČR a SR.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="text-white font-semibold mb-2">Komunita</h3>
              <p className="text-gray-400 text-sm">Sdílej traily, piš recenze a pomáhej ostatním bikerům.</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">🚵</div>
              <h3 className="text-white font-semibold mb-2">Pro všechny</h3>
              <p className="text-gray-400 text-sm">Traily pro začátečníky i experty, děti i dospělé.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Pomůžeš nám rozjet to naplno?</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Jsem otevřený každé pomocné ruce. Jestli umíš kódovat, fotit traily, píšeš dobře nebo prostě znáš parádní místa k ježdění — ozvi se. Trails for All stavíme společně a každý, kdo přiloží ruku k dílu, je vítaný člen party.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Tady nejde o ego, jde o kola, blato a dobrý pocit po parádní jízdě. 🚵
          </p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-4">Kontakt</h2>
          <p className="text-gray-400 mb-6">Máš nápad, chceš pomoct nebo se jen pobavit o trailech? Napiš!</p>
          <button
            onClick={() => window.location.href = 'mailto:info@pasek-art.cz'}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
          >
            info@pasek-art.cz
          </button>
        </div>

      </div>
    </div>
  )
}
