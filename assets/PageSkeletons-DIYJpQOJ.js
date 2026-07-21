function e(e=``){return`<div class="animate-pulse rounded-2xl bg-white/12 ${e}"></div>`}function t(t={}){let{mountNode:n,variant:r=`workspace`}=t,i=document.createElement(`div`);i.className=`mx-auto flex min-h-screen w-full max-w-[1380px] flex-col gap-lg px-lg py-lg md:px-2xl md:py-2xl`;let a=document.createElement(`section`);a.className=`rounded-3xl border border-neutral-cream/15 bg-[linear-gradient(145deg,rgba(20,16,13,0.96),rgba(42,23,16,0.90))] p-xl shadow-brand backdrop-blur md:p-2xl`,a.innerHTML=`
    <div class="flex flex-col gap-2xl lg:flex-row lg:items-start">
      <div class="min-w-0 flex-1">
        ${e(`h-8 w-[180px]`)}
        ${e(`mt-lg h-16 max-w-[460px]`)}
        ${e(`mt-md h-16 max-w-[360px]`)}
        ${e(`mt-2xl h-5 max-w-[640px]`)}
        ${e(`mt-md h-5 max-w-[560px]`)}
      </div>
      <div class="w-full rounded-3xl border border-neutral-cream/14 bg-neutral-cream/8 p-xl lg:w-[320px]">
        ${e(`h-4 w-[150px]`)}
        ${e(`mt-lg h-14 w-full`)}
        ${e(`mt-lg h-4 w-full`)}
        ${e(`mt-sm h-4 w-[82%]`)}
        ${e(`mt-xl h-12 w-full rounded-full`)}
      </div>
    </div>
  `;let o=document.createElement(`section`);if(o.className=`grid gap-lg`,r===`calendar`){let t=document.createElement(`div`);t.className=`rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand`,t.innerHTML=`
      <div class="grid gap-md lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        ${e(`h-[54px] w-full bg-neutral-charcoal/8`)}
        ${e(`h-[54px] w-full bg-neutral-charcoal/8`)}
        ${e(`h-[54px] w-full bg-neutral-charcoal/8`)}
        ${e(`h-[54px] w-full bg-neutral-charcoal/8`)}
      </div>
    `;let n=document.createElement(`div`);n.className=`rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand`,n.innerHTML=`
      ${e(`h-6 w-[180px] bg-neutral-charcoal/8`)}
      ${e(`mt-md h-4 w-[260px] bg-neutral-charcoal/8`)}
      <div class="mt-xl grid gap-md md:grid-cols-7">
        ${Array.from({length:14}).map(()=>e(`h-[140px] bg-neutral-charcoal/8`)).join(``)}
      </div>
    `,o.append(t,n)}else if(r===`table`){let t=document.createElement(`div`);t.className=`rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand`,t.innerHTML=`
      ${e(`h-6 w-[180px] bg-neutral-charcoal/8`)}
      ${e(`mt-md h-4 w-[320px] bg-neutral-charcoal/8`)}
      ${e(`mt-xl h-[54px] w-full bg-neutral-charcoal/8`)}
    `;let n=document.createElement(`div`);n.className=`overflow-hidden rounded-3xl border border-neutral-charcoal/10 bg-white/90 shadow-brand`,n.innerHTML=`
      <div class="hidden grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] gap-lg border-b border-neutral-charcoal/8 bg-brand-cheese/22 px-xl py-lg md:grid">
        ${e(`h-4 w-[70px] bg-neutral-charcoal/8`)}
        ${e(`h-4 w-[90px] bg-neutral-charcoal/8`)}
        ${e(`h-4 w-[120px] bg-neutral-charcoal/8`)}
        ${e(`h-4 w-[70px] bg-neutral-charcoal/8`)}
      </div>
      <div class="divide-y divide-neutral-charcoal/8">
        ${Array.from({length:4}).map(()=>`
          <div class="grid gap-lg px-lg py-lg md:grid-cols-[160px_minmax(0,1.1fr)_minmax(0,1.8fr)_180px] md:items-center md:px-xl">
            ${e(`h-4 w-[90px] bg-neutral-charcoal/8`)}
            <div>
              ${e(`h-8 w-[220px] bg-neutral-charcoal/8`)}
              ${e(`mt-sm h-4 w-[110px] bg-neutral-charcoal/8 md:hidden`)}
            </div>
            <div>
              ${e(`h-4 w-full bg-neutral-charcoal/8`)}
              ${e(`mt-sm h-4 w-[88%] bg-neutral-charcoal/8`)}
            </div>
            <div class="flex md:justify-end">
              ${e(`h-12 w-full rounded-full bg-neutral-charcoal/8 md:w-[150px]`)}
            </div>
          </div>
        `).join(``)}
      </div>
    `,o.append(t,n)}else if(r===`dashboard`){let t=document.createElement(`div`);t.className=`grid gap-lg xl:grid-cols-2`,t.innerHTML=Array.from({length:3}).map(()=>`
      <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
        ${e(`h-8 w-[220px] bg-neutral-charcoal/8`)}
        ${e(`mt-md h-4 w-[260px] bg-neutral-charcoal/8`)}
        <div class="mt-xl grid gap-md">
          ${e(`h-[78px] w-full bg-neutral-charcoal/8`)}
          ${e(`h-[78px] w-full bg-neutral-charcoal/8`)}
        </div>
      </section>
    `).join(``),o.appendChild(t)}else{let t=document.createElement(`div`);t.className=`grid gap-lg xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]`,t.innerHTML=`
      <div class="grid gap-lg">
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
          ${e(`h-6 w-[200px] bg-neutral-charcoal/8`)}
          ${e(`mt-md h-4 w-[300px] bg-neutral-charcoal/8`)}
          <div class="mt-xl grid gap-md">
            ${e(`h-[54px] w-full bg-neutral-charcoal/8`)}
            ${e(`h-[54px] w-full bg-neutral-charcoal/8`)}
            ${e(`h-[220px] w-full bg-neutral-charcoal/8`)}
          </div>
        </section>
      </div>
      <div class="grid gap-lg">
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
          ${e(`h-6 w-[180px] bg-neutral-charcoal/8`)}
          <div class="mt-xl grid gap-md sm:grid-cols-2">
            ${e(`h-[110px] w-full bg-neutral-charcoal/8`)}
            ${e(`h-[110px] w-full bg-neutral-charcoal/8`)}
            ${e(`h-[110px] w-full bg-neutral-charcoal/8`)}
            ${e(`h-[110px] w-full bg-neutral-charcoal/8`)}
          </div>
        </section>
        <section class="rounded-3xl border border-neutral-charcoal/10 bg-white/90 p-xl shadow-brand">
          ${e(`h-6 w-[160px] bg-neutral-charcoal/8`)}
          ${e(`mt-md h-4 w-full bg-neutral-charcoal/8`)}
          ${e(`mt-sm h-4 w-[88%] bg-neutral-charcoal/8`)}
        </section>
      </div>
    `,o.appendChild(t)}return i.append(a,o),n&&n.replaceChildren(i),{shell:i}}export{t};