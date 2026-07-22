import { SkipLink } from './components/layout/SkipLink'
import { SiteHeader } from './components/layout/SiteHeader'
import { SiteFooter } from './components/layout/SiteFooter'
import { Hero } from './components/sections/Hero'
import { Services } from './components/sections/Services'
import { Equipment } from './components/sections/Equipment'
import { Quality } from './components/sections/Quality'
import { Works } from './components/sections/Works'
import { Company } from './components/sections/Company'
import { Quote } from './components/sections/Quote'

function App() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Services />
        <Equipment />
        <Quality />
        <Works />
        <Company />
        <Quote />
      </main>
      <SiteFooter />
    </>
  )
}

export default App
