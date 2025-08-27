"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatbotPage } from "@/hooks/chatbot/types";

interface AnimatedPageContainerProps {
  currentPage: ChatbotPage;
  children: React.ReactNode;
}

// Page transition variants for smooth animations
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: -20,
  },
};

const pageTransition = {
  type: "tween" as const,
  ease: "easeInOut" as const,
  duration: 0.3,
};

const AnimatedPageContainer: React.FC<AnimatedPageContainerProps> = ({
  currentPage,
  children,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={pageTransition}
          className="absolute inset-0 w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPageContainer;
