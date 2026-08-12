// Enhanced collapsible role-based navigation sidebar (Admin / Warden / Student).
import {
  Shield,
  X,
  ChevronRight,
} from "lucide-react";
import { cls } from "../utils/classNames";
import { Avatar } from "../components/common/Avatar";

export function Sidebar({ nav,current,onNav,onProfile,open,onClose,accentClass,tagLabel,footerName,footerSub }) {
  const splitAt = nav.length > 7 ? 6 : nav.length;
  const groups  = nav.length > 7
    ? [{title:"Management",items:nav.slice(0,splitAt)},{title:"Analytics & Safety",items:nav.slice(splitAt)}]
    : [{title:"",items:nav}];
  return (
    <>
      {open&&<div className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300" onClick={onClose}/>}
      <aside className={cls("fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-out w-72 bg-[#0c2340]",open?"translate-x-0 shadow-2xl":"-translate-x-full lg:translate-x-0 lg:shadow-xl")}>
        <div className="flex items-center gap-4 px-5 py-5 border-b border-white/10">
          <div className={cls("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110",accentClass)}><Shield size={19} className="text-white"/></div>
          <div className="flex-1 min-w-0"><div className="text-white font-bold text-base leading-tight">Smart Hostel</div><div className="text-blue-300 text-xs">{tagLabel}</div></div>
          <button onClick={onClose} className="ml-auto p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white lg:hidden transition-all"><X size={19}/></button>
        </div>
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {groups.map(g=>(
            <div key={g.title}>
              {g.title&&<div className="px-3 pt-3 pb-2 text-blue-400 text-xs font-bold uppercase tracking-widest">{g.title}</div>}
              {g.items.map(({id,label,icon:Icon,badge})=>(
                <button key={id} onClick={()=>{onNav(id);onClose();}}
                  className={cls(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative overflow-hidden",
                    current===id
                      ? cls("text-white shadow-lg",accentClass)
                      : "text-blue-200 hover:bg-white/10 hover:text-white hover:translate-x-1"
                  )}
                  aria-current={current===id?"page":undefined}
                >
                  <Icon size={17} className={cls("transition-colors",current===id?"text-white":"text-blue-400 group-hover:text-blue-200")}/>
                  <span className="flex-1 text-left">{label}</span>
                  {badge!=null&&<span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{badge}</span>}
                  {current!==id&&<ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0"/>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => { onProfile?.(); onClose?.(); }}
            className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-xl px-4 py-3 transition-all duration-200 cursor-pointer text-left hover:shadow-md group"
          >
            <Avatar name={footerName} size="sm"/>
            <div className="flex-1 min-w-0"><div className="text-white text-sm font-semibold truncate">{footerName}</div><div className="text-blue-300 text-xs truncate">{footerSub}</div></div>
            <ChevronRight size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"/>
          </button>
        </div>
      </aside>
    </>
  );
}
