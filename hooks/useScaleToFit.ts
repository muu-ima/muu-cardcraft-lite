"use client";
import { useEffect, useRef, useState } from "react";

export function useScaleToFit(baseW: number, enabled: boolean = true) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useEffect(() =>{
        if(!enabled) return;
        const el = ref.current;
        if(!el) return;

        const update = () => {
            const w = el.clientWidth;
            setScale(Math.min(w / baseW, 1));
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [baseW, enabled]);

    return { ref, scale};
}