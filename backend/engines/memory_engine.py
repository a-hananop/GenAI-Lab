import uuid, math, datetime
from typing import Dict, Any, List, Optional
from database.db import SessionLocal, MemoryDB


def _keywords(text: str) -> List[str]:
    stop = {"the","a","an","is","in","of","and","to","for","with","that","this","it","be","are","was","will"}
    return list(set(w for w in text.lower().replace(","," ").replace("."," ").split() if len(w)>3 and w not in stop))[:15]


def _cosine(k1, k2):
    s1,s2=set(k1),set(k2)
    if not s1 or not s2: return 0.0
    return len(s1&s2)/math.sqrt(len(s1)*len(s2))


async def store_memory(memory_type,title,content,tags=None,outcome="neutral",confidence=0.5,related_ids=None):
    mid=str(uuid.uuid4()); kw=_keywords(content+" "+title)
    db=SessionLocal()
    try:
        db.add(MemoryDB(id=mid,memory_type=memory_type,title=title,content=content,
                        embedding_keywords=kw,related_ids=related_ids or [],
                        confidence_at_time=confidence,outcome=outcome,tags=tags or []))
        db.commit()
        return {"id":mid,"memory_type":memory_type,"title":title,"content":content,
                "embedding_keywords":kw,"related_ids":related_ids or [],
                "confidence_at_time":confidence,"outcome":outcome,"tags":tags or [],
                "created_at":datetime.datetime.utcnow().isoformat()}
    finally:
        db.close()


async def search_memory(query: str, limit: int = 10):
    qkw=_keywords(query)
    db=SessionLocal()
    try:
        mems=db.query(MemoryDB).order_by(MemoryDB.created_at.desc()).all()
        scored=sorted([(round(_cosine(qkw,m.embedding_keywords or []),4),m) for m in mems],key=lambda x:x[0],reverse=True)
        return [{"id":m.id,"memory_type":m.memory_type,"title":m.title,"content":m.content,
                 "embedding_keywords":m.embedding_keywords or [],"related_ids":m.related_ids or [],
                 "confidence_at_time":m.confidence_at_time,"outcome":m.outcome,"tags":m.tags or [],
                 "created_at":m.created_at.isoformat() if m.created_at else None,"relevance_score":sc}
                for sc,m in scored[:limit]]
    finally:
        db.close()


async def get_all_memories(memory_type=None):
    db=SessionLocal()
    try:
        q=db.query(MemoryDB)
        if memory_type: q=q.filter(MemoryDB.memory_type==memory_type)
        rows=q.order_by(MemoryDB.created_at.desc()).all()
        return [{"id":r.id,"memory_type":r.memory_type,"title":r.title,"content":r.content,
                 "embedding_keywords":r.embedding_keywords or [],"related_ids":r.related_ids or [],
                 "confidence_at_time":r.confidence_at_time,"outcome":r.outcome,"tags":r.tags or [],
                 "created_at":r.created_at.isoformat() if r.created_at else None} for r in rows]
    finally:
        db.close()


async def get_knowledge_graph():
    db=SessionLocal()
    try:
        mems=db.query(MemoryDB).all()
        nodes=[{"id":m.id,"label":m.title[:30],"type":m.memory_type,"outcome":m.outcome,"confidence":m.confidence_at_time} for m in mems]
        edges=[]; seen=set()
        kws=[(m.id,m.embedding_keywords or []) for m in mems]
        for i in range(len(kws)):
            for j in range(i+1,len(kws)):
                sim=_cosine(kws[i][1],kws[j][1])
                if sim>0.25:
                    ek=tuple(sorted([kws[i][0],kws[j][0]]))
                    if ek not in seen:
                        edges.append({"source":kws[i][0],"target":kws[j][0],"weight":round(sim,3)})
                        seen.add(ek)
        return {"nodes":nodes,"edges":edges,"total_nodes":len(nodes),"total_edges":len(edges)}
    finally:
        db.close()
