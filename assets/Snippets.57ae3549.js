import{E as d,Y as f,_ as c,f as u,r as _,o as a,c as l,b as n,d as h,w as m,a as v,t as g,h as o,H as y,i as C,F as S}from"./app.8ae4f082.js";import{C as k}from"./Common.fd9c6a0a.js";function p(e){return new Date(e.frontmatter.date).getTime()}function x(e,t){return p(t)-p(e)}const B=e=>e.sort((t,s)=>x(t,s));async function L(){return(await f()).filter(t=>t.path!=="/snippets/"&&t.path.includes("/snippets/"))}const T=()=>{const e=d([]);return L().then(t=>{e.value=B(t)}),e},$={class:"title"},w=["innerHTML"],D=u({props:{item:{type:Object,required:!0}},setup(e){const t=s=>s.replace(/<h1.*<\/h1>/,"");return(s,i)=>{const r=_("RouterLink");return a(),l("div",{class:"snippet-card",onClick:i[0]||(i[0]=b=>s.$router.push(e.item.path))},[n("div",$,[h(r,{to:e.item.path},{default:m(()=>[v(g(e.item.title),1)]),_:1},8,["to"])]),n("div",{innerHTML:t(e.item.excerpt)},null,8,w)])}}});var N=c(D,[["__file","SnippetCard.vue"]]);const E=n("div",{class:"snippets-title"},[n("h1",null,"Snippets"),n("p",{style:{opacity:"0.8"}},"A space for storing these messy segments.")],-1),H={class:"snippets"},V=u({setup(e){const t=T();return(s,i)=>(a(),o(k,null,{page:m(()=>[E,n("div",H,[(a(!0),l(S,null,y(C(t),r=>(a(),o(N,{key:r.path,item:r},null,8,["item"]))),128))])]),_:1}))}});var P=c(V,[["__file","Snippets.vue"]]);export{P as default};
