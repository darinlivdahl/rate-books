import nytDeveloperLogo from './assets/poweredby_nytimes_200a.png'

function Footer() {
    return (
        <footer class="pb-12">
        <div class="container w-[90%] md:w-[80%] 2xl:w-[70%] mx-auto">
          <hr />
          <div class="mt-4 mb-4">
            <a href="https://developer.nytimes.com" target="_blank" title="Data Provided By The New York Times"><img src={nytDeveloperLogo} alt="Data Provided By The New York Times logo" /></a>
          </div>
          <p class="font-sans text-sm">Designed and developed by <a href="https://livdahl.dev" class="text-emerald-600" target="_blank">Darin Livdahl</a> with <span class="text-red-700">☕</span>. This website is not affiliated with or endorsed by The New York Times.</p>
        </div>
      </footer>
    );
}

export default Footer;