import { Trefoil } from "ldrs/react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
// oxlint-disable-next-line import/no-unassigned-import
import "ldrs/react/Trefoil.css";

const MIN_DISPLAY_MS = 1600;

const exitAnimation = { opacity: 0, filter: "blur(10px)" } as const;
const exitTransition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] } as const;

export const AppLoader = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-background"
          exit={exitAnimation}
          transition={exitTransition}
        >
          <Trefoil size={48} speed={1.4} color="var(--primary)" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
