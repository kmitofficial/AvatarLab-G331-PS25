export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: "easeIn" } },
};

export const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
}

export const videoVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.3, duration: 0.6,}},
};

export const workspaceVideoVariants = { 
  initial: { opacity: 0, scale: 0.8 }, 
  animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeInOut', type: 'tween' } }, 
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.8, ease: 'easeInOut', type: 'tween' } } 
};

export const workspaceVoiceVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const fadeScaleAnimation = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: {
    duration: 0.8,
    ease: [0.4, 0, 0.2, 1],
  },
}