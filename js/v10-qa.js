/* JEJU TRIP v10.1 — mobile QA & resilient navigation layer */
(function(){
  'use strict';
  const T=window.TRIP_DATA||{};
  const KEY='jeju-trip-v10-checks';

  function getChecks(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}
  }
  function saveChecks(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}

  window.JejuTripQA={
    version:'10.1',
    maps:function(place, provider){
      const q=encodeURIComponent(String(place)+', Jeju-do, South Korea');
      const urls={
        google:'https://www.google.com/maps/search/?api=1&query='+q,
        naver:'https://map.naver.com/p/search/'+q
      };
      const url=urls[provider]||urls.google;
      window.open(url,'_blank','noopener,noreferrer');
      return url;
    },
    shareDay:async function(i){
      const d=(T.days||[])[i]; if(!d)return;
      const lines=(d.schedule||[]).map(x=>x[0]+' '+x[1]);
      const text='济州岛 '+d.date+'｜'+d.title+'\n'+lines.join('\n');
      if(navigator.share){try{await navigator.share({title:'Jeju Trip · '+d.date,text})}catch(e){}}
      else if(navigator.clipboard){await navigator.clipboard.writeText(text); alert('当日行程已复制，可粘贴到微信/短信分享。')}
    },
    toggle:function(key){
      const c=getChecks(); c[key]=!c[key]; saveChecks(c); return c[key];
    },
    checked:function(key){return !!getChecks()[key]},
    clear:function(){localStorage.removeItem(KEY)}
  };

  document.addEventListener('click',function(e){
    const map=e.target.closest('[data-map-place]');
    if(map){e.preventDefault(); JejuTripQA.maps(map.dataset.mapPlace,map.dataset.mapProvider||'google');}
    const share=e.target.closest('[data-share-day]');
    if(share){e.preventDefault(); JejuTripQA.shareDay(Number(share.dataset.shareDay));}
    const check=e.target.closest('[data-trip-check]');
    if(check){
      e.preventDefault();
      const on=JejuTripQA.toggle(check.dataset.tripCheck);
      check.setAttribute('aria-checked',String(on));
      check.classList.toggle('is-checked',on);
    }
  });

  // Make dynamically created external-map links safe and obvious.
  document.querySelectorAll('a[target="_blank"]').forEach(a=>{
    a.rel='noopener noreferrer';
  });

  // SW registration: relative path works on GitHub Pages project sites.
  if('serviceWorker' in navigator){
    window.addEventListener('load',function(){
      navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(function(){});
    });
  }
})();