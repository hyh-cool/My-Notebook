import{_ as f,f as v,u as g,g as x,r as B,o as k,h as C,w as _,b as o,t,d as L,a as F,i as r}from"./app.06af1a99.js";import{C as A}from"./Common.0e646aee.js";const D={class:"theme-container"},M={class:"not-found"},b={class:"emoji"},y=v({setup(N){var n,u,c;const l=g(),e=x(),a=(n=e.value.notFound)!=null?n:["Not Found"],m=()=>a[Math.floor(Math.random()*a.length)],i=(u=e.value.home)!=null?u:l.value,h=(c=e.value.backToHome)!=null?c:"Back to home",s=["\\(o_o)/","(o^^)o","(\u02DA\u0394\u02DA)b","(^-^*)","(^_^)b","(\u256F\u2035\u25A1\u2032)\u256F","(='X'=)","(>_<)","\\(\xB0\u02CA\u0414\u02CB\xB0)/","\u311F(\u2594\u25BD\u2594)\u310F"],d=()=>s[Math.floor(Math.random()*s.length)];return(T,j)=>{const p=B("RouterLink");return k(),C(A,null,{page:_(()=>[o("div",D,[o("div",M,[o("p",b,t(d()),1),o("h1",null,"404 - "+t(m()),1),L(p,{to:r(i)},{default:_(()=>[F(t(r(h)),1)]),_:1},8,["to"])])])]),_:1})}}});var w=f(y,[["__file","404.vue"]]);export{w as default};