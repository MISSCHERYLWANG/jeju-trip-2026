/* JEJU TRIP V10: mobile execution helpers */
(function(){
  const T=window.TRIP_DATA||{};
  (T.days||[]).forEach((d,i)=>{ if(!d.color) d.color=["#E96B4B","#D99A36","#3F8D74","#5579A8"][i]; });
  window.JejuTripV10={
    maps:function(place,provider){
      const q=encodeURIComponent(place+", Jeju");
      const google="https://www.google.com/maps/search/?api=1&query="+q;
      const naver="https://map.naver.com/p/search/"+q;
      window.open(provider==="naver"?naver:google,"_blank","noopener,noreferrer");
    },
    shareDay:function(i){
      const d=(T.days||[])[i]; if(!d) return;
      const text="济州岛 "+d.date+"｜"+d.title+"\n"+(d.schedule||[]).map(x=>x[0]+" "+x[1]).join("\n");
      if(navigator.share) navigator.share({title:"Jeju Trip · "+d.date,text:text});
      else if(navigator.clipboard) navigator.clipboard.writeText(text);
    }
  };
  document.addEventListener("click",function(e){
    const b=e.target.closest("[data-map-place]");
    if(b) JejuTripV10.maps(b.dataset.mapPlace,b.dataset.mapProvider);
    const s=e.target.closest("[data-share-day]");
    if(s) JejuTripV10.shareDay(Number(s.dataset.shareDay));
  });
})();