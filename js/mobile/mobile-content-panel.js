(function phoneContentPopup(){
 const mobile=matchMedia('(max-width:850px)'),layout=document.querySelector('.layout'),panel=layout.querySelector('.battle'),canvas=layout.querySelector('.right');
 const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)'),originalInert=canvas.inert;
 const viewport=document.getElementById('boardZoomSpace').parentElement,anchor=document.createComment('phone preview canvas home');viewport.before(anchor);
 const preview=document.createElement('div');preview.className='phone-content-preview';preview.hidden=true;preview.setAttribute('aria-label','キャンバスプレビュー');document.querySelector('.content-select-row').before(preview);
 const originalViewportInert=viewport.inert;
 let savedPosition=null,previewFrame;
 function capturePosition(){const ancestors=[];for(let node=viewport.parentElement;node;node=node.parentElement)ancestors.push({node,left:node.scrollLeft,top:node.scrollTop});return {left:viewport.scrollLeft,top:viewport.scrollTop,ancestors}}
 function restorePosition(position){if(viewport.parentElement===preview)return;for(const item of position.ancestors){item.node.scrollLeft=item.left;item.node.scrollTop=item.top}viewport.scrollLeft=position.left;viewport.scrollTop=position.top}
 for(const button of document.querySelectorAll('.phone-content-icon,.phone-nav [data-pane="content"]')){const open=button.onclick;button.onclick=function(event){if(mobile.matches&&!layout.classList.contains('phone-content-open'))savedPosition=capturePosition();return open?.call(this,event)}}
 function fitPreview(){if(preview.hidden)return;const comparison=document.querySelector('.phase-comparison-grid'),width=comparison?comparison.offsetWidth:640,height=comparison?comparison.offsetHeight:640;const scale=Math.max(0.01,Math.min(Math.max(0,viewport.clientWidth-8)/width,Math.max(0,viewport.clientHeight-8)/height));preview.style.setProperty('--phone-preview-scale',String(scale));viewport.scrollLeft=0;viewport.scrollTop=0}
 function schedulePreview(){cancelAnimationFrame(previewFrame);previewFrame=requestAnimationFrame(fitPreview)}
 function syncPreview(open){
  preview.hidden=!open;viewport.inert=open||originalViewportInert;
  if(open){if(viewport.parentElement!==preview){savedPosition??=capturePosition();preview.append(viewport)}fitPreview();schedulePreview()}
  else if(viewport.parentElement===preview){cancelAnimationFrame(previewFrame);anchor.after(viewport);const position=savedPosition;savedPosition=null;if(position){restorePosition(position);requestAnimationFrame(()=>{restorePosition(position);requestAnimationFrame(()=>restorePosition(position))})}}
 }
 new ResizeObserver(schedulePreview).observe(preview);
 const renderBeforeContentPreview=render;render=function(){renderBeforeContentPreview();if(!preview.hidden)schedulePreview()};
 const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='phone-content-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-label','コンテンツパネルを閉じる');layout.append(backdrop);
 let visible=false,closing=false,panelAnimation=null,backdropAnimation=null,closeAnimation=null;
 const duration=()=>reducedMotion.matches?0:200;
 function cancelAnimations(){panelAnimation?.cancel();backdropAnimation?.cancel();closeAnimation?.cancel();panelAnimation=backdropAnimation=closeAnimation=null}
 function sync(){
  const open=mobile.matches&&layout.classList.contains('phone-content-open');
  if(open===visible)return;
  cancelAnimations();visible=open;closing=false;canvas.inert=open||originalInert;backdrop.hidden=!open;
  closeButton.style.removeProperty('visibility');
  syncPreview(open);
  if(open){
   panelAnimation=panel.animate([{transform:'translateX(-100%)'},{transform:'translateX(0)'}],{duration:duration(),easing:'ease-out'});
   closeAnimation=closeButton.animate([{transform:'translateX(-'+panel.offsetWidth+'px)'},{transform:'translateX(0)'}],{duration:duration(),easing:'ease-out'});
   backdropAnimation=backdrop.animate([{opacity:0},{opacity:1}],{duration:duration(),easing:'ease-out'});
  }
 }
 function close(hideCloseButton=false){
  if(closing||!layout.classList.contains('phone-content-open'))return;
  cancelAnimations();closing=true;
  if(hideCloseButton===true)closeButton.style.visibility='hidden';
  panelAnimation=panel.animate([{transform:'translateX(0)'},{transform:'translateX(-100%)'}],{duration:duration(),easing:'ease-in',fill:'forwards'});
  closeAnimation=closeButton.animate([{transform:'translateX(0)'},{transform:'translateX(-'+panel.offsetWidth+'px)'}],{duration:duration(),easing:'ease-in',fill:'forwards'});
  backdropAnimation=backdrop.animate([{opacity:1},{opacity:0}],{duration:duration(),easing:'ease-in',fill:'forwards'});
  panelAnimation.finished.then(()=>{
   layout.classList.remove('phone-content-open');sync();closeButton.style.removeProperty('visibility');
   if(mobile.matches){for(const button of document.querySelectorAll('.phone-nav button'))button.setAttribute('aria-pressed',String(button.dataset.pane==='canvas'));document.querySelector('.phone-content-icon')?.focus({preventScroll:true})}
  }).catch(()=>{});
 }
 backdrop.onclick=close;
 const closeButton=document.createElement('button');closeButton.type='button';closeButton.className='phone-content-close';closeButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg>';closeButton.setAttribute('aria-label','コンテンツパネルを閉じる');closeButton.title='コンテンツパネルを閉じる';closeButton.onclick=()=>close(true);layout.append(closeButton);
 document.addEventListener('keydown',event=>{
  if(!mobile.matches||!layout.classList.contains('phone-content-open'))return;
  if(event.key==='Escape'){event.preventDefault();close();return}
  if(event.target.closest('input,select,textarea,[contenteditable="true"],dialog'))return;
  const key=event.key.toLowerCase(),shortcut=(event.ctrlKey||event.metaKey)&&['c','v','x','z','y'].includes(key),objectAction=['delete','backspace'].includes(key)||key.startsWith('arrow')&&!event.target.closest('#pages,button,[role="separator"]');
  if(shortcut||objectAction){event.preventDefault();event.stopImmediatePropagation()}
 },true);
 new MutationObserver(sync).observe(layout,{attributes:true,attributeFilter:['class']});
 mobile.addEventListener('change',()=>{layout.classList.remove('phone-content-open');sync()});sync();
 document.addEventListener('pointerdown',event=>{if(!mobile.matches||!visible||event.target.closest('.battle,.phone-phase-navigation,.phone-content-backdrop,.phone-content-close,.color-popover,.native-color-picker,.phone-nav,.phone-content-icon,.phase-content-copy-menu,.phase-item-menu,.content-item-menu,.phase-group-menu,.phase-copy-menu,#pcTutorial'))return;close()},true);
})();
